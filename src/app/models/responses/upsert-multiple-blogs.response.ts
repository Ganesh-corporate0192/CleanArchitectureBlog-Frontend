export interface UpsertBlogResponse {
  id: number;
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}

export interface UpsertMultipleBlogsResponse {
  blogs: UpsertBlogResponse[];
  success: boolean;
}