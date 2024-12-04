import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
	ClassicEditor,
	Bold,
	Essentials,
	Heading,
	Indent,
	IndentBlock,
	Italic,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	Table,
	Undo,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

export default function TextEditor({
	initialValue,
	onChange,
}: {
	initialValue: string;
	onChange: (value: string) => void;
}) {
	return (
		<CKEditor
			editor={ClassicEditor}
			config={{
				licenseKey: 'GPL',
				toolbar: [
					'heading',
					'|',
					'bold',
					'italic',
					'|',
					'link',
					'insertTable',
					'mediaEmbed',
					'|',
					'bulletedList',
					'numberedList',
					'indent',
					'outdent',
				],
				plugins: [
					Bold,
					Essentials,
					Heading,
					Indent,
					IndentBlock,
					Italic,
					Link,
					List,
					MediaEmbed,
					Paragraph,
					Table,
					Undo,
				],
				initialData: initialValue,
			}}
			onChange={(event, editor) => {
				const data = editor.getData();
				onChange(data);
			}}
		/>
	);
}
