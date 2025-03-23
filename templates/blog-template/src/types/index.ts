export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author_id: string;
  tags: string[];
  published_at: string;
} 