import axiosClient from '../../apis/axiosClient';

export const submitReview = async (
	productId: number,
	rating: number,
	comment: string
) => {
	try {
		const response = await axiosClient.post('/reviews', {
			product_id: productId,
			rating,
			comment,
		});
		return response.data;
	} catch (error) {
		console.error('Error submit review:', error);
		throw new Error('Failed to submit review');
	}
};

export const gellReviewByProductId = async (productId: number) => {
	try {
		const response = await axiosClient.get(`/products/${productId}/reviews`);
		return response.data.data;
	} catch (error) {
		console.error('Error get reviews by product ID:', error);
		throw new Error('Failed to get reviews by product ID');
	}
};
