import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

// Define an interface for the order structure
interface Product {
  _key: string;
  quantity: number;
  product: {
    _id: string;
    _type: string;
    name: string;
    price: number;
    image?: string;
    slug?: string;
    description?: string;
    stock?: number;
  };
}

interface Order {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  currency: string;
  amountDiscount?: number;
  clerkUserId: string;
  customerName: string;
  email: string;
  products: Product[];
}

export async function getMyOrders(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const MY_ORDERS_QUERY = defineQuery(`
    *[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      orderNumber,
      orderDate,
      status,
      totalPrice,
      currency,
      amountDiscount,
      clerkUserId,
      customerName,
      email,
      products[] {
        _key,
        quantity,
        product-> {
          _id,
          _type,
          name,
          price,
          image,
          slug,
          description,
          stock
        }
      }
    }
  `);

  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });

    const processedOrders = orders.data?.map((order: Order) => ({
      ...order,
      products: order.products?.filter((productItem: Product) => productItem.product !== null) || []
    })) || [];

    console.log("Processed orders data:", JSON.stringify(processedOrders, null, 2));

    return processedOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Error fetching orders.");
  }
}