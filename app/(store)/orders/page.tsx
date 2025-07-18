import { formatCurrency } from "@/lib/formatCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

interface Order {
  orderNumber: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  currency: string;
  amountDiscount?: number;
  products?: Product[];
}

interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

async function Orders() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card text-card-foreground p-4 sm:p-8 rounded-xl shadow-lg w-full max-w-4xl border border-border">
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>You have not placed any order yet.</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {orders.map((order: Order) => (
              <div
                key={order.orderNumber}
                className="bg-card text-card-foreground border border-border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-border">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 font-bold">
                        Order Number
                      </p>
                      <p className="font-mono text-sm text-green-600 dark:text-green-400 break-all">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                      <p className="font-medium text-foreground">
                        {order.orderDate && !isNaN(new Date(order.orderDate).getTime())
                          ? new Date(order.orderDate).toLocaleDateString()
                          : "Date not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center">
                      <span className="text-sm mr-2 text-foreground">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-bold text-lg text-foreground">
                        {formatCurrency(order.totalPrice ?? 0, order.currency)}
                      </p>
                    </div>
                  </div>
                  {order.amountDiscount ? (
                    <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-red-600 dark:text-red-400 font-medium mb-1 text-sm sm:text-base">
                        Discount Applied:{" "}
                        {formatCurrency(order.amountDiscount, order.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Original Subtotal:{" "}
                        {formatCurrency(
                          (order.totalPrice ?? 0) + order.amountDiscount,
                          order.currency
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="px-4 py-3 sm:px-6 sm:py-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
                    Order Items
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    {order.products?.map((product: Product) => (
                      <div
                        key={product.product._id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          {product.product?.image && (
                            <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 rounded-md overflow-hidden border border-border">
                              <Image
                                src={imageUrl(product.product.image).url()}
                                alt={product.product?.name ?? ""}
                                className="object-cover"
                                fill
                              />
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-sm sm:text-base text-foreground">
                              {product.product?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {product.quantity ?? "N/A"}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-right text-foreground">
                          {product.product?.price && product.quantity
                            ? formatCurrency(
                                product.product.price * product.quantity,
                                order.currency
                              )
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;