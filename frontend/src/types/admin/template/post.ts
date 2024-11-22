export interface Posts {
    id: number;
    title: string;
    content: string;
    image: string;
    category_id: number;
    category_name: string;
    slug: string;
    published_at: string;
    created_at: string;
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