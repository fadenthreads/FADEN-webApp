import { createSavedRoutes } from "@/lib/saved-items/api-handlers";

const cartRoutes = createSavedRoutes("cart");
export const GET = cartRoutes.GET;
export const POST = cartRoutes.POST;
export const DELETE = cartRoutes.DELETE;
