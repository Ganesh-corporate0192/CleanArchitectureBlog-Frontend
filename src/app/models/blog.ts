export interface Blog {
  id?: number;
  clientId?: string;
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}

export interface BlogResponse {
  id: number;
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}

export interface CreateBlogCommand {
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}

export interface UpdateBlogCommand {
  id: number;
  name: string;
  description: string;
  author: string;
  imageUrl: string;
}