import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = 'edge'; // Ensure this is at the top level

export async function POST(req: NextRequest) {
  console.log("Webhook route hit"); // Confirm route is hit

  try {
    const rawBody = await req.text();
    console.log("Raw body:", rawBody); // Debug raw body

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

    // Handle specific event types
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Session metadata:", session.metadata); // Debug metadata

      if (!session.metadata || !session.metadata.orderNumber) {
        console.warn("Missing orderNumber in session metadata. Skipping...");
        return new Response(
          JSON.stringify({ error: "Missing orderNumber in metadata" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await updateOrderStatus(session);
    } else if (event.type === "charge.updated") {
      const charge = event.data.object as Stripe.Charge;
      console.log("Charge updated:", charge);
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

  async function updateOrderStatus(session: Stripe.Checkout.Session) {
    const { metadata } = session;
  
    console.log("Metadata in updateOrderStatus:", metadata);
  
    const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as Metadata;
  
    if (!orderNumber || typeof orderNumber !== "string") {
      console.error("Invalid or missing orderNumber:", orderNumber);
      return;
    }
  
    console.log(`Processing order: ${orderNumber}`);
  
    try {
      const existingOrder = await backendClient.fetch(
        `*[_type == "order" && orderNumber == $orderNumber][0]`,
        { orderNumber }
      );
      console.log("Existing order fetched from Sanity:", existingOrder);
  
      const parsedProducts = JSON.parse((metadata?.products ?? "[]"));
  
      if (!existingOrder) {
        console.error(`Order not found in Sanity for orderNumber: ${orderNumber}`);
        // Create the order in Sanity
        console.log("Creating a new order in Sanity...");
        await backendClient.create({
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
          status: "pending",
          products: parsedProducts, // Save parsed products array
        });
        console.log("Order created successfully in Sanity.");
        return;
      }
  
      // Update the order status to "paid"
      await backendClient.patch(existingOrder._id)
        .set({ status: "paid" })
        .commit();
      console.log("Order status updated to 'paid' in Sanity");
    } catch (err) {
      console.error("Failed to update order in Sanity:", err);
    }
  }
}

async function updateChargeDetails(charge: Stripe.Charge) {
  console.log("Updating charge details:", charge);

  try {
    const existingOrder = await backendClient.fetch(
      `*[_type == "order" && stripePaymentIntentId == $paymentIntentId][0]`,
      { paymentIntentId: charge.payment_intent }
    );

    if (!existingOrder) {
      console.error("Order not found for charge:", charge.id);
      return;
    }

    await backendClient.patch(existingOrder._id)
      .set({
        chargeStatus: charge.status,
        receiptUrl: charge.receipt_url,
        failureMessage: charge.failure_message || null,
      })
      .commit();

    console.log("Charge details updated successfully in Sanity.");
  } catch (err) {
    console.error("Failed to update charge details in Sanity:", err);
  }
}

