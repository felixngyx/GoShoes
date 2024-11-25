export interface Posts {
    id: number;
    title: string;
    content: string;
    image: string;
    category_id: number;
    category_name: string;
    slug: string;
    scheduled_at: string | null;
    published_at: string | null;
    created_at: string | null;
}

export interface PostResponse {
    posts: Posts[];
    pagination: {
        currentPage: number;
        perPage: number;
        totalItems: number;
        totalPages: number;
    }
}