import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/basket",
  "/categories(.*)",
  "/orders", // Consider if this should be protected - usually order history requires auth
  "/product(.*)",
  "/search",
  "/success",
  "/store(.*)",
  "/webhooks(.*)",
  "/webhook(.*)", // Added for your Stripe webhook
  "/sign-in(.*)", // Add Clerk auth routes
  "/sign-up(.*)", // Add Clerk auth routes
  // Add any other public routes you need
]);

// Alternative approach - Only protect specific routes (recommended for e-commerce)
// Uncomment this and comment out the above if you prefer this approach:
/*
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)", 
  "/account(.*)",
  "/admin(.*)",
  "/settings(.*)",
  "/orders(.*)", // Protect order history
  "/my-orders(.*)",
  // Add other routes that should require authentication
]);
*/

export default clerkMiddleware(async (auth, req) => {
  // Current approach - protect everything except public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  // Alternative approach - only protect specific routes (uncomment if using isProtectedRoute)
  /*
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  */
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // skips static files
    "/(api|trpc)(.*)",
  ],
};