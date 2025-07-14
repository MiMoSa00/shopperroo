import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { NextRequest } from "next/server";
import Stripe from "stripe";

// Define interface for product item
interface ProductItem {
  quantity: number;
  product: string;
  _id?: string;
  id?: string;
}

// Remove edge runtime - it may be causing issues with Sanity client
// export const runtime = 'edge';

// Move helper functions outside the main POST function
async function updateOrderStatus(session: Stripe.Checkout.Session) {
  const { metadata } = session;

  console.log("Metadata in updateOrderStatus:", metadata);

  const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as Metadata;

  if (!orderNumber || typeof orderNumber !== "string") {
    console.error("Invalid or missing orderNumber:", orderNumber);
    throw new Error(`Invalid orderNumber: ${orderNumber}`);
  }

  console.log(`Processing order: ${orderNumber}`);

  try {
    const existingOrder = await backendClient.fetch(
      `*[_type == "order" && orderNumber == $orderNumber][0]`,
      { orderNumber }
    );
    console.log("Existing order fetched from Sanity:", existingOrder?._id || 'Not found');

    // Parse products and ensure proper structure
    let parsedProducts: ProductItem[] = [];
    try {
      const rawProducts = JSON.parse(metadata?.products || "[]");
      console.log("Raw products from metadata:", rawProducts);
      
      // Transform products to proper Sanity reference structure
      parsedProducts = rawProducts.map((item: ProductItem) => ({
        quantity: item.quantity || 1,
        product: {
          _type: "reference",
          _ref: item.product || item._id || item.id // Handle different possible ID fields
        }
      }));
      
      console.log("Transformed products for Sanity:", parsedProducts);
    } catch (parseError) {
      console.error("Failed to parse products metadata:", parseError);
      parsedProducts = [];
    }

    if (!existingOrder) {
      console.log("Creating a new order in Sanity...");
      
      const newOrder = await backendClient.create({
        _type: "order",
        orderNumber,
        customerName,
        email: customerEmail,
        clerkUserId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: session.customer,
        stripePaymentIntentId: session.payment_intent,
        amountDiscount: (session.total_details?.amount_discount ?? 0) / 100,
        totalPrice: (session.amount_total ?? 0) / 100,
        currency: session.currency,
        orderDate: new Date().toISOString(),
        status: "paid", // Set to paid since checkout is completed
        products: parsedProducts, // Use the properly structured products
      });
      
      console.log("Order created successfully in Sanity:", newOrder._id);
      return;
    }

    // Update the order status to "paid"
    const updatedOrder = await backendClient.patch(existingOrder._id)
      .set({ 
        status: "paid",
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: session.customer,
        stripePaymentIntentId: session.payment_intent,
        amountDiscount: (session.total_details?.amount_discount ?? 0) / 100,
        totalPrice: (session.amount_total ?? 0) / 100,
        products: parsedProducts, // Update products with proper structure
      })
      .commit();
      
    console.log("Order status updated to 'paid' in Sanity:", updatedOrder._id);
  } catch (err) {
    console.error("Failed to update order in Sanity:", err);
    throw new Error(`Sanity operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

async function updateChargeDetails(charge: Stripe.Charge) {
  console.log("Updating charge details for charge:", charge.id);

  try {
    const existingOrder = await backendClient.fetch(
      `*[_type == "order" && stripePaymentIntentId == $paymentIntentId][0]`,
      { paymentIntentId: charge.payment_intent }
    );

    if (!existingOrder) {
      console.warn("Order not found for charge:", charge.id);
      return; // Don't throw error, just log warning
    }

    const updatedOrder = await backendClient.patch(existingOrder._id)
      .set({
        chargeStatus: charge.status,
        receiptUrl: charge.receipt_url,
        failureMessage: charge.failure_message || null,
      })
      .commit();

    console.log("Charge details updated successfully in Sanity:", updatedOrder._id);
  } catch (err) {
    console.error("Failed to update charge details in Sanity:", err);
    throw new Error(`Charge update failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function POST(req: NextRequest) {
  console.log("Webhook route hit");

  try {
    const rawBody = await req.text();
    console.log("Raw body:", rawBody);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No signature in request headers");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
      console.log("Webhook verified:", event.type);
    } catch (err) {
      console.error("Webhook verification failed:", err instanceof Error ? err.message : err);
      return new Response(
        JSON.stringify({ error: "Webhook verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Event data:", event);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Session metadata:", session.metadata);

      if (!session.metadata || !session.metadata.orderNumber) {
        console.warn("Missing orderNumber in session metadata. Skipping...");
        return new Response(
          JSON.stringify({ error: "Missing orderNumber in metadata" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await updateOrderStatus(session);
    } else if (event.type === "charge.succeeded") {
      const charge = event.data.object as Stripe.Charge;
      await updateChargeDetails(charge);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}