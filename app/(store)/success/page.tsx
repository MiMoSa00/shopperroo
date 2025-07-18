"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useBasketStore from "@/store/store";

function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const clearBasket = useBasketStore((state) => state.clearBasket);

  useEffect(() => {
    if (orderNumber) {
      clearBasket();
    }
  }, [orderNumber, clearBasket]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card text-card-foreground p-12 rounded-xl shadow-lg max-w-2xl w-full mx-4 border border-border">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border border-green-200 dark:border-green-700">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-center text-foreground">
          Thank You for Your Order!
        </h1>
        <div className="border-t border-b border-border py-6 mb-6">
          <p className="text-lg text-muted-foreground dark:text-white mb-4">
            Your order has been confirmed and will be shipped shortly.
          </p>
          <div className="space-y-2">
            {orderNumber && (
              <p className="text-muted-foreground dark:text-white flex items-center space-x-5">
                <span>Order Number:</span>
                <span className="font-mono text-sm text-green-600 dark:text-green-400">
                  {orderNumber}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white">
            <Link href="/orders">View Order Details</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-white dark:text-black dark:hover:bg-gray-100">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;