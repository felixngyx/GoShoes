const generateSlug = (title: string) => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 8);
	const baseSlug = title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[đĐ]/g, 'd')
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();

	return `${baseSlug}-${timestamp}-${randomString}`;
};

export default generateSlug;
