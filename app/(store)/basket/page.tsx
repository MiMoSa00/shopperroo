"use client";
import { createCheckoutSession, Metadata } from "@/actions/createCheckoutSession";
import AddToBasketButton from "@/components/AddToBasketButton";
import Loader from "@/components/ui/Loader";
import { imageUrl } from "@/lib/imageUrl";
import useBasketStore from "@/store/store";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function BasketPage() {
  const groupedItems = useBasketStore((state) => state.getGroupedItems());
  console.log(groupedItems)
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wait for client to mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loader />;
  }

  if (groupedItems.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Your basket</h1>
        <p className="text-muted-foreground text-lg">Your basket is empty.</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
        clerkUserId: user!.id,
      };

      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-full bg-background">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Your Basket</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          {groupedItems?.map((item) => (
            <div key={item.product._id} className="mb-4 p-4 border border-border rounded bg-card text-card-foreground flex items-center">
              <div
                className="flex items-center cursor-pointer flex-1 min-w-0"
                onClick={() => router.push(`/product/${item.product.slug?.current}`)}
              >
                <div className="w-20 h-20 sm:h-24 sm:w-24 flex-shrink-0 mr-4">
                  {item.product.image?.asset?._ref ? (
                    <Image
                      src={imageUrl(item.product.image).url()}// Correct usage of imageUrl
                      alt={item.product.name ?? "Product image"}
                      className="w-full h-full object-cover rounded"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold truncate text-foreground">{item.product.name}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Price: ${((item.product.price ?? 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center ml-4 flex-shrink-0">
                <AddToBasketButton product={item.product} disabled={false} />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80 lg:sticky lg:top-4 h-fit bg-card text-card-foreground p-4 border border-border rounded order-first lg:order-last fixed bottom-0 left-0 lg:left-auto">
          <h3 className="text-xl font-semibold text-foreground">Order Summary</h3>
          <div className="mt-4 space-y-2">
            <p className="flex justify-between text-foreground">
              <span>Items:</span>
              <span>{groupedItems.reduce((total, item) => total + item.quantity, 0)}</span>
            </p>
            <p className="flex justify-between text-2xl font-bold border-t border-border mt-2 pt-2 text-foreground">
              <span>Total:</span>
              <span>${useBasketStore.getState().getTotalPrice().toFixed(2)}</span>
            </p>
          </div>

          {isSignedIn ? (
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Checkout"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                Sign in to Checkout
              </button>
            </SignInButton>
          )}
        </div>

        <div className="h-64 lg:h-6">{/* Spacer for fixed checkout on mobile */}</div>
      </div>
    </div>
  );
}

export default BasketPage;