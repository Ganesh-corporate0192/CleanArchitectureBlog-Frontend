export interface UpsertBlogItemRequest {
  id: number; // 0 for new
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}

export interface UpsertMultipleBlogsRequest {
  blogs: UpsertBlogItemRequest[];
}