"use server";

import { imageUrl } from "@/lib/imageUrl";
import stripe from "@/lib/stripe";
import { BasketItem } from "@/store/store";
import { v4 as uuidv4 } from 'uuid';
import sanityClient from "@sanity/client";

export type Metadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
};

export type GroupedBasketItem = {
    product: BasketItem["product"];
    quantity: number;
};

const sanity = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: true,
    token: process.env.SANITY_WRITE_TOKEN,
});

export async function createCheckoutSession(
    items: BasketItem[],
    metadata: Metadata,
): Promise<string | null> {
    try {
        // Check if any grouped items don't have a price
        console.log(items);
        console.log(metadata);
        
        const itemsWithoutPrice = items.filter((item) => item.product.price === undefined);
        if (itemsWithoutPrice.length > 0) {
            throw new Error("Some items do not have a price");
        }

        // Log metadata for debugging
        console.log("Metadata being sent to Stripe:", metadata);

        // Search for existing customer by email
        const customers = await stripe.customers.list({
            email: metadata.customerEmail,
            limit: 1,
        });

        let customerId: string | undefined;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        }

        const baseUrl =
            process.env.NODE_ENV === "production"
                ? `https://${process.env.VERCEL_URL}`
                : `${process.env.NEXT_PUBLIC_BASE_URL}`;

        const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`;
        const cancelUrl = `${baseUrl}/basket`;

        // Calculate total price
        const totalPrice = items.reduce((total, item) => {
            return total + ((item.product.price ?? 0) * item.quantity);
        }, 0);

        // Create the Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            customer_creation: customerId ? undefined : "always",
            customer_email: !customerId ? metadata.customerEmail : undefined,
            metadata: {
                orderNumber: metadata.orderNumber,
                customerName: metadata.customerName,
                customerEmail: metadata.customerEmail,
                clerkUserId: metadata.clerkUserId,
                products: JSON.stringify(
                    items.map((item) => ({
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image,
                        product: item.product._id,
                        quantity: item.quantity,
                    }))
                ),
            },
            mode: "payment",
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
            line_items: items.map((item) => ({
                price_data: {
                    currency: "usd",
                    unit_amount: Math.round((item.product.price ?? 0) * 100),
                    product_data: {
                        name: item.product.name || "Unnamed Product",
                        description: `Product ID: ${item.product._id}`,
                        metadata: {
                            id: item.product._id,
                        },
                        images: item.product.image
                            ? [imageUrl(item.product.image).url()]
                            : undefined,
                    },
                },
                quantity: item.quantity,
            })),
        });

        console.log("Stripe Checkout session created:", session.id);

        // Create order in Sanity with all required fields
        const orderData = {
            _type: 'order',
            orderNumber: metadata.orderNumber,
            customerName: metadata.customerName,
            customerEmail: metadata.customerEmail, // Keep consistent with field name
            clerkUserId: metadata.clerkUserId,
            orderDate: new Date().toISOString(), // Add the missing orderDate
            status: 'pending', // Initial status
            totalPrice: totalPrice,
            currency: 'usd',
            products: items.map((item) => ({
                _key: uuidv4(),
                name: item.product.name,
                image: item.product.image,
                product: item.product._id,
                quantity: item.quantity,
            })),
        };

        await sanity.create(orderData);

        return session.url;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}