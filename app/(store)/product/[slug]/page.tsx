import AddToBasketButton from "@/components/AddToBasketButton";
import { imageUrl } from "@/lib/imageUrl";
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { PortableText } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";

import { SanityLive } from "@/sanity/lib/live";
import ReviewsSectionWrapper from "@/components/ReviewsSectionWrapper";

export const revalidate = 60;
export const dynamicParams = true;

// ✅ Explicitly type PageProps to satisfy Next.js + TS
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function ProductPage({ params }: PageProps) {
  const { slug } = await params; // Await the params promise
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div
          className={`relative aspect-square overflow-hidden rounded-lg shadow-lg bg-card border border-border ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          {product.image && (
            <Image
              src={imageUrl(product.image).url()}
              alt={product.name ?? "Product image"}
              fill
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between bg-card text-card-foreground p-6 rounded-lg border border-border">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">{product.name}</h1>
            <div className="text-xl font-semibold mb-4 text-foreground">
              ₦{product.price?.toFixed(2)}
            </div>
            <div className="prose max-w-none mb-6 text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>
          <div className="mt-6">
            <AddToBasketButton product={product} disabled={isOutOfStock} />
          </div>
        </div>
      </div>

      <SanityLive />

      {/* ✅ Reviews Section with required productId */}
      <div className="mt-12">
        <ReviewsSectionWrapper productId={product._id ?? product.slug.current} />
      </div>
    </div>
  );
}

export default ProductPage;