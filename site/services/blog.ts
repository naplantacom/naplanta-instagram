import { apiGet } from "./api";
import type { PostsResponse } from "@/types/blog";

/** Posts do blog (notícias do mercado imobiliário de SC). */
export function getPosts(limit = 3, revalidate = 1800): Promise<PostsResponse> {
  return apiGet<PostsResponse>("blog.php", { params: { limit }, revalidate });
}
