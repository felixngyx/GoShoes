export const TINYMCE_SETTINGS = {
	height: 500,
	menubar: true,
	plugins: [
		'advlist',
		'autolink',
		'lists',
		'link',
		'image',
		'charmap',
		'anchor',
		'searchreplace',
		'visualblocks',
		'code',
		'fullscreen',
		'insertdatetime',
		'media',
		'table',
		'preview',
		'help',
		'wordcount',
	],
	toolbar:
		'undo redo | blocks | ' +
		'bold italic forecolor | alignleft aligncenter ' +
		'alignright alignjustify | bullist numlist outdent indent | ' +
		'removeformat | help | image',
	content_style:
		'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
	branding: false,
	promotion: false,
	language: 'en',
	// Thêm API key của TinyMCE (đăng ký miễn phí tại: https://www.tiny.cloud/)
	apiKey: import.meta.env.VITE_TINYMCE_API_KEY,
	send_stats: false,
};
