import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/basket",
  "/categories(.*)",
  "/orders",
  "/product(.*)",
  "/search",
  "/success",
  "/store(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // skips static files
    "/(api|trpc)(.*)",
  ],
};