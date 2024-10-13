export const formatVNCurrency = (value: number) => {
	return value.toLocaleString('vi-VN', {
		style: 'currency',
		currency: 'VND',
	});
};
