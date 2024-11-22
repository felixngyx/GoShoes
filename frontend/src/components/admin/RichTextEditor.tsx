import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TINYMCE_SETTINGS } from '../../common/tinymce';

interface RichTextEditorProps {
    initialValue?: string;
    onChange?: (content: string) => void;
}

const RichTextEditor = ({ initialValue = '', onChange }: RichTextEditorProps) => {
    const editorRef = useRef<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleEditorChange = (content: string) => {
        if (onChange) {
            onChange(content);
        }
    };

    const handleImageUpload = async (blobInfo: any): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            try {
                setIsUploading(true);
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
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
                toast.success('Tải ảnh thành công');
            } catch (error) {
                reject('Image upload failed');
                toast.error('Không thể tải ảnh lên');
            } finally {
                setIsUploading(false);
            }
        });
    };

    return (
        <div className="relative">
            <Editor
                apiKey={TINYMCE_SETTINGS.apiKey}
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={initialValue}
                init={{
                    ...TINYMCE_SETTINGS,
                    images_upload_handler: handleImageUpload,
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    // Thêm các placeholder khi upload ảnh
                    image_uploadtab: true,
                    image_advtab: true,
                    images_reuse_filename: true,
                }}
                onEditorChange={handleEditorChange}
            />
            {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white">Đang tải ảnh lên...</div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;