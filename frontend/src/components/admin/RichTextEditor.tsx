import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-hot-toast';
import { TINYMCE_SETTINGS } from '../../common/tinymce';

interface RichTextEditorRef {
	setContent: (content: string) => void;
	getContent: () => string;
}

interface RichTextEditorProps {
	initialValue?: string;
	onChange?: (content: string) => void;
	key?: string;
	height?: number;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
	({ initialValue = '', onChange, key, height = 500 }, ref) => {
		const editorRef = useRef<any>(null);
		const [isUploading, setIsUploading] = useState(false);

		useImperativeHandle(ref, () => ({
			setContent: (content: string) => {
				if (editorRef.current) {
					editorRef.current.setContent(content);
				}
			},
			getContent: () => {
				return editorRef.current ? editorRef.current.getContent() : '';
			},
		}));

		const handleEditorChange = (content: string) => {
			if (onChange) {
				onChange(content);
			}
		};

		const handleImageUpload = async (blobInfo: any): Promise<string> => {
			return new Promise(async (resolve, reject) => {
				const formData = new FormData();
				formData.append('file', blobInfo.blob(), blobInfo.filename());
				formData.append(
					'upload_preset',
					import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
				);

				try {
					setIsUploading(true);
					const response = await fetch(
						`https://api.cloudinary.com/v1_1/${
							import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
						}/image/upload`,
						{
							method: 'POST',
							body: formData,
						}
					);

					if (!response.ok) {
						throw new Error('Upload failed');
					}

					const data = await response.json();
					resolve(data.secure_url);
					toast.success('Image uploaded successfully');
				} catch (error) {
					reject('Image upload failed');
					toast.error('Unable to upload image');
				} finally {
					setIsUploading(false);
				}
			});
		};

		return (
			<div className="relative">
				<Editor
					key={key}
					apiKey={TINYMCE_SETTINGS.apiKey}
					onInit={(evt, editor) => {
						editorRef.current = editor;
					}}
					initialValue={initialValue}
					init={{
						...TINYMCE_SETTINGS,
						images_upload_handler: handleImageUpload,
						automatic_uploads: true,
						height: height,
						file_picker_types: 'image',
						directionality: 'ltr',
						content_style: 'body { direction: ltr; }',
					}}
					onEditorChange={onChange}
				/>
				{isUploading && (
					<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
						<div className="text-white">Uploading image...</div>
					</div>
				)}
			</div>
		);
	}
);

export default RichTextEditor;
