// types/order.ts
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface SanityReference {
  _ref: string;
  _type: 'reference';
  _weak?: boolean;
}

export interface SanityImage {
  asset: SanityReference;
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
  _type: 'image';
}

export interface SanityImageHotspot {
  _type: 'sanity.imageHotspot';
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface SanityImageCrop {
  _type: 'sanity.imageCrop';
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface OrderProductItem {
  _key: string;
  product: SanityReference | null;
  quantity: number;
}

export interface PopulatedProduct {
  _id: string;
  name: string;
  price: number;
  image?: SanityImageSource;
}

export interface PopulatedOrderProductItem {
  _key: string;
  product: PopulatedProduct | null;
  quantity: number;
}

export interface SanityOrder {
  _id: string;
  _type: 'order';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  orderNumber?: string;
  stripeCheckoutSessionId?: string;
  stripeCustomerId?: string;
  clerkUserId?: string;
  customerName?: string;
  email?: string;
  stripePaymentIntentId?: string;
  products?: PopulatedOrderProductItem[];
  totalPrice?: number;
  currency?: string;
  amountDiscount?: number;
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: string;
}

export interface PopulatedOrder extends Omit<SanityOrder, 'products'> {
  products: PopulatedOrderProductItem[];
  hasValidProducts: boolean;
}