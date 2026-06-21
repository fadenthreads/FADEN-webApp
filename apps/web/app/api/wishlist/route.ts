import { createSavedRoutes } from "@/lib/saved-items/api-handlers";

const wishlistRoutes = createSavedRoutes("wishlist");
export const GET = wishlistRoutes.GET;
export const POST = wishlistRoutes.POST;
export const DELETE = wishlistRoutes.DELETE;
