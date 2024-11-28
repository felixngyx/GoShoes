import React, { useState, useRef, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Status } from '.';
import categoryService, { CATEGORY } from '../../../services/admin/category';
import sizeService, { SIZE } from '../../../services/admin/size';
import brandService, { BRAND } from '../../../services/admin/brand';
import productService, {
	PRODUCT,
	PRODUCT_DETAIL,
} from '../../../services/admin/product';
import toast from 'react-hot-toast';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import uploadImageToCloudinary from '../../../common/uploadCloudinary';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { COLOR } from '../../../services/admin/color';
import colorService from '../../../services/admin/color';
import { Eye, TrashIcon, Logs, Upload, X, ArrowLeft } from 'lucide-react';
import LoadingIcon from '../../../components/common/LoadingIcon';
import RichTextEditor from '../../../components/admin/RichTextEditor';
import generateSlug from '../../../common/generateSlug';

// Add form validation schema
const productSchema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Name is required',
		'any.required': 'Name is required',
	}),
	price: Joi.number().positive().required().messages({
		'number.base': 'Price must be a number',
		'number.positive': 'Price must be greater than 0',
		'any.required': 'Price is required',
	}),
	promotional_price: Joi.number()
		.positive()
		.max(Joi.ref('price'))
		.required()
		.messages({
			'number.base': 'Promotional price must be a number',
			'number.positive': 'Promotional price must be greater than 0',
			'number.max': 'Promotional price must be less than the original price',
			'any.required': 'Promotional price is required',
		}),
	status: Joi.string()
		.valid('public', 'unpublic', 'hidden')
		.required()
		.messages({
			'string.empty': 'Status cannot be empty',
			'any.only': 'Status is invalid',
			'any.required': 'Status is required',
		}),
	sku: Joi.string().required().messages({
		'string.empty': 'SKU cannot be empty',
		'any.required': 'SKU is required',
	}),
	hagtag: Joi.string().required().messages({
		'string.empty': 'Hashtag cannot be empty',
		'any.required': 'Hashtag is required',
	}),
	category_ids: Joi.array().items(Joi.number()).min(1).required().messages({
		'array.base': 'Category must be an array',
		'array.min': 'Must select at least one category',
		'any.required': 'Category is required',
	}),
	brand_id: Joi.number().required().messages({
		'number.base': 'Brand must be a number',
		'any.required': 'Brand is required',
	}),
	thumbnail: Joi.string().required().messages({
		'string.empty': 'Thumbnail cannot be empty',
		'any.required': 'Thumbnail is required',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Description cannot be empty',
		'any.required': 'Description is required',
	}),
	variants: Joi.array()
		.items(
			Joi.object({
				color_id: Joi.number().invalid(0).required().messages({
					'number.invalid': 'Please select a color',
					'any.required': 'Color is required',
					'number.base': 'Please select a color',
					'any.invalid': 'Please select a color',
				}),
				image: Joi.string().required().messages({
					'string.empty': 'Variant image cannot be empty',
					'any.required': 'Variant image is required',
				}),
				variant_details: Joi.array()
					.items(
						Joi.object({
							size_id: Joi.number().min(1).required().messages({
								'number.base': 'Please select a size',
								'number.min': 'Please select a size',
								'any.required': 'Please select a size',
							}),
							quantity: Joi.number().min(1).required().messages({
								'number.base': 'Quantity must be a number',
								'number.min': 'Quantity must be greater than 0',
								'any.required': 'Quantity is required',
							}),
							sku: Joi.string().allow('').optional(),
						})
					)
					.min(1)
					.required()
					.messages({
						'array.min': 'Must have at least one size',
						'any.required': 'Size is required',
						'array.base': 'Please select a size',
					}),
			})
		)
		.required()
		.min(1)
		.messages({
			'array.base': 'Variant must be an array',
			'array.min': 'Must have at least one variant',
			'any.required': 'Variant is required',
		}),
});

// Thêm type cho size trong variant
type VariantSize = {
	size_id: number;
	quantity: number;
	sku: string;
};

const UpdateProduct = () => {
	const { id } = useParams();
	const [product, setProduct] = useState<PRODUCT_DETAIL | null>(null);
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [sizes, setSizes] = useState<SIZE[]>([]);
	const [brands, setBrands] = useState<BRAND[]>([]);
	const [colors, setColors] = useState<COLOR[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<CATEGORY[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [stockQuantity, setStockQuantity] = useState(0);
	const [description, setDescription] = useState('');
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const {
		register,
		handleSubmit,
		control,
		clearErrors,
		setValue,
		formState: { errors },
	} = useForm<PRODUCT>({
		resolver: joiResolver(productSchema),
		defaultValues: {
			variants: [
				{
					color_id: 0,
					image: '',
					variant_details: [
						{
							size_id: 0,
							quantity: 0,
							sku: '',
						},
					],
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'variants',
	});

	const [thumbnailFile, setThumbnailFile] = useState<File | string>('');
	const modalRef = useRef<HTMLDialogElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const variantImagesInputRefs = useRef<{
		[key: number]: HTMLInputElement | null;
	}>({});

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	// Thêm state để quản lý sizes cho từng variant
	const [variantSizes, setVariantSizes] = useState<{
		[key: number]: VariantSize[];
	}>({});

	// Thêm state để quản lý search
	const [colorSearchTerms, setColorSearchTerms] = useState<{
		[key: number]: string;
	}>({});

	// Thêm state để quản lý variant images
	const [variantImageFiles, setVariantImageFiles] = useState<{
		[key: number]: (File | string)[];
	}>({});

	// Thêm state để lưu giá trị trước đó
	const [previousValues, setPreviousValues] = useState<{
		[key: string]: number;
	}>({});

	useEffect(() => {
		(async () => {
			try {
				setLoadingData(true);
				const [resCategory, resSize, resBrand, resColor, resProduct] =
					await Promise.all([
						categoryService.getAll(),
						sizeService.getAll(),
						brandService.getAll(),
						colorService.getAll(),
						productService.getById(Number(id)),
					]);

				setCategories(resCategory.data?.categories?.data || []);
				setSizes(resSize.data?.sizes?.data || []);
				setBrands(resBrand.data?.data?.brands || []);
				setColors(resColor.data?.clors?.data || []);

				const productData: PRODUCT = {
					...resProduct.data.data,
					category_ids: resProduct.data.data.categories,
					variants: JSON.parse(resProduct.data.data.variants),
				};

				const productDetailData: PRODUCT_DETAIL = {
					...productData,
					variants: JSON.parse(resProduct.data.data.variants),
				};

				setProduct(productDetailData);
				console.log('product----------', productData);

				console.log('productData----------', productData);

				// Set form values
				setValue('name', productData.name);
				setValue('price', Number(productData.price));
				setValue(
					'promotional_price',
					Number(productData.promotional_price)
				);
				setValue('status', productData.status);
				setValue('sku', productData.sku);
				setValue('hagtag', productData.hagtag);
				setValue('brand_id', Number(productData.brand_id));
				setValue('thumbnail', productData.thumbnail);
				setValue('description', productData.description);

				// Set description state
				setDescription(productData.description);

				// Set thumbnail
				setThumbnailFile(productData.thumbnail);

				// Set categories
				const productCategories =
					resCategory.data?.categories?.data.filter((cat: CATEGORY) =>
						productData.category_ids.includes(Number(cat.id))
					) || [];
				setSelectedCategories(productCategories);
				setValue(
					'category_ids',
					productCategories.map((cat) => Number(cat.id))
				);

				// Set variants
				const formattedVariants = productData.variants.map(
					(variant: any) => ({
						color_id: variant.color_id,
						image: variant.image,
						variant_details: variant.sizes,
					})
				);

				setValue('variants', formattedVariants);

				// Set color search terms
				const colorTermsMap: { [key: number]: string } = {};
				formattedVariants.forEach((variant: any, index: number) => {
					const color = resColor.data?.clors?.data.find(
						(c: COLOR) => c.id === variant.color_id
					);
					if (color) {
						colorTermsMap[index] = color.color;
					}
				});
				setColorSearchTerms(colorTermsMap);

				productData.variants.forEach((variant: any, index: number) => {
					variant.sizes.forEach((detail: any) => {
						handleAddSize(index, detail.size_id, detail.quantity);
					});
				});

				// Set variant sizes
				// const variantSizesMap: { [key: number]: VariantSize[] } = {};
				// productData.variants.forEach((variant: any, index: number) => {
				// 	variantSizesMap[index] = variant.variant_details;
				// });
				// setVariantSizes(variantSizesMap);

				// Calculate and set stock quantity
				const totalQuantity = productData.variants.reduce(
					(acc: number, variant: any) => {
						return (
							acc +
							variant.sizes.reduce(
								(variantAcc: number, detail: any) =>
									variantAcc + Number(detail.quantity),
								0
							)
						);
					},
					0
				);
				setStockQuantity(totalQuantity);

				// Set variant images
				const variantImagesMap: { [key: number]: (File | string)[] } = {};
				productData.variants.forEach((variant: any, index: number) => {
					const images = variant.image
						.split(',')
						.map((img: string) => img.trim());
					variantImagesMap[index] = images;
				});
				setVariantImageFiles(variantImagesMap);

				// Set previous values for quantity tracking
				const prevValues: { [key: string]: number } = {};

				setPreviousValues(prevValues);
			} catch (error) {
				console.error('Error fetching product data---------------:', error);
				toast.error('Error fetching product data');
			} finally {
				setLoadingData(false);
			}
		})();
	}, [id, setValue]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			// Set the value for the thumbnail field
			setValue('thumbnail', file.name);
			clearErrors('thumbnail');
		}
	};

	const removeThumbnail = () => {
		setThumbnailFile('');
		// Clear the thumbnail value
		setValue('thumbnail', '');
	};

	const openModal = (imageSrc: string) => {
		setPreviewImage(imageSrc);
		modalRef.current?.showModal();
	};

	const closeModal = () => modalRef.current?.close();

	const handleUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const handleVariantImagesUploadClick = (
		e: React.MouseEvent,
		variantIndex: number
	) => {
		e.preventDefault();
		e.stopPropagation();
		variantImagesInputRefs.current[variantIndex]?.click();
	};

	// Modify the append function to initialize with empty values
	const addVariant = () => {
		append({
			color_id: 0,
			image: '',
			variant_details: [
				{
					size_id: 0,
					quantity: 0,
					sku: '',
				},
			],
		});

		const newIndex = fields.length;

		// Khởi tạo state cho variant mới với giá trị mặc định
		setVariantSizes((prev) => ({
			...prev,
			[newIndex]: [{ size_id: 0, quantity: 0, sku: '' }],
		}));

		// Khởi tạo previousValues cho variant mới
		setPreviousValues((prev) => ({
			...prev,
			[`variants.${newIndex}.size.0.quantity`]: 0,
		}));

		setColorSearchTerms((prev) => ({
			...prev,
			[newIndex]: '',
		}));
	};

	const removeVariant = (index: number) => {
		// Lấy variant hiện tại từ form
		const currentVariant = control._formValues.variants[index];

		// Cập nhật stockQuantity bằng cách trừ đi tất cả quantity trong variant bị xóa
		if (currentVariant?.size) {
			currentVariant.size.forEach((_: VariantSize, sizeIndex: number) => {
				const inputPath = `variants.${index}.size.${sizeIndex}.quantity`;
				const quantityToRemove = previousValues[inputPath] || 0;
				setStockQuantity((prev) => prev - quantityToRemove);

				// Xóa previous values cho variant này
				setPreviousValues((prev) => {
					const newPrev = { ...prev };
					delete newPrev[inputPath];
					return newPrev;
				});
			});
		}

		// Cập nhật lại index cho các state khác
		setVariantSizes((prev) => {
			const newVariantSizes: { [key: number]: VariantSize[] } = {};
			Object.entries(prev).forEach(([key, value]) => {
				const keyNum = parseInt(key);
				if (keyNum < index) {
					newVariantSizes[keyNum] = value;
				} else if (keyNum > index) {
					newVariantSizes[keyNum - 1] = value;
				}
			});
			return newVariantSizes;
		});

		// Cập nhật lại previousValues cho các variant còn lại
		setPreviousValues((prev) => {
			const newPrev: { [key: string]: number } = {};
			Object.entries(prev).forEach(([key, value]) => {
				const match = key.match(/variants\.(\d+)\.size\.(\d+)\.quantity/);
				if (match) {
					const variantIndex = parseInt(match[1]);
					const sizeIndex = match[2];
					if (variantIndex < index) {
						newPrev[key] = value;
					} else if (variantIndex > index) {
						newPrev[
							`variants.${variantIndex - 1}.size.${sizeIndex}.quantity`
						] = value;
					}
				}
			});
			return newPrev;
		});

		// Cập nhật các state khác như cũ
		setVariantImageFiles((prev) => {
			const newFiles = { ...prev };
			delete newFiles[index];
			Object.keys(newFiles).forEach((key) => {
				const keyNum = parseInt(key);
				if (keyNum > index) {
					newFiles[keyNum - 1] = newFiles[keyNum];
					delete newFiles[keyNum];
				}
			});
			return newFiles;
		});

		setColorSearchTerms((prev) => {
			const newTerms = { ...prev };
			delete newTerms[index];
			Object.keys(newTerms).forEach((key) => {
				const keyNum = parseInt(key);
				if (keyNum > index) {
					newTerms[keyNum - 1] = newTerms[keyNum];
					delete newTerms[keyNum];
				}
			});
			return newTerms;
		});

		remove(index);
	};

	// Hàm để tạo SKU cho variant
	const generateVariantSKU = (
		productSKU: string,
		colorName: string,
		size: string
	) => {
		return `${productSKU}-${colorName}-${size}`;
	};

	const onSubmit = async (data: PRODUCT) => {
		try {
			setLoading(true);
			let thumbnailName = '';
			if (thumbnailFile instanceof File) {
				thumbnailName = await uploadImageToCloudinary(thumbnailFile);
			} else {
				thumbnailName = data.thumbnail;
			}

			const formattedData = {
				...data,
				is_deleted: false,
				slug: generateSlug(data.name),
				thumbnail: thumbnailName,
				description: description,
				variants: await Promise.all(
					data.variants.map(async (variant, index) => {
						const imageUrls = await Promise.all(
							(variantImageFiles[index] || []).map(async (file) => {
								if (file instanceof File) {
									const uploadedUrl = await uploadImageToCloudinary(
										file
									);
									return uploadedUrl;
								}
								return file;
							})
						);

						const color = colors.find((c) => c.id === variant.color_id);
						const colorName = color ? color.color : '';

						return {
							...variant,
							variant_details: variant.variant_details.map((detail) => {
								// Tìm size name cho từng variant detail
								const size = sizes.find(
									(s) => Number(s.id) === Number(detail.size_id)
								);
								const sizeName = size ? size.size : '';

								// Tạo SKU riêng cho từng combination của color và size
								const variantSKU = generateVariantSKU(
									data.sku,
									colorName,
									sizeName
								);

								return {
									...detail,
									sku: variantSKU,
								};
							}),
							image: imageUrls.join(', '),
						};
					})
				),
			};

			formattedData.stock_quantity = stockQuantity;

			console.log('Formatted submit data:', formattedData);
			const response = await productService.update(
				Number(id),
				formattedData
			);
			console.log('Response:', response);
			if (response.status.toString() === '201') {
				toast.success('Update product successfully!');
				navigate('/admin/product');
			}
		} catch (error: any) {
			console.error('Error submitting form:', error);
			toast.error(error.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryChange = (categoryId: number) => {
		const category = categories.find((cat) => Number(cat.id) === categoryId);
		if (category) {
			const newSelectedCategories = [...selectedCategories, category];
			setSelectedCategories(newSelectedCategories);
			setValue(
				'category_ids',
				newSelectedCategories.map((cat) => Number(cat.id))
			);
			clearErrors('category_ids');
		}
	};

	const removeCategory = (categoryId: number) => {
		const newSelectedCategories = selectedCategories.filter(
			(cat) => Number(cat.id) !== categoryId
		);
		setSelectedCategories(newSelectedCategories);
		setValue(
			'category_ids',
			newSelectedCategories.map((cat) => Number(cat.id))
		);
	};

	// Hàm xử lý thêm size cho variant
	const handleAddSize = (
		variantIndex: number,
		sizeId: number = 0,
		quantity: number = 0
	) => {
		const newSize: VariantSize = {
			size_id: sizeId,
			quantity: quantity,
			sku: '',
		};

		// Lấy giá trị hiện tại từ form thay vì fields
		const currentValues: VariantSize[] =
			control._formValues.variants[variantIndex].sizes || [];

		setVariantSizes((prev) => ({
			...prev,
			[variantIndex]: [...(prev[variantIndex] || []), newSize],
		}));

		// Cập nhật form với giá trị hiện tại + size mới
		setValue(`variants.${variantIndex}.variant_details`, [
			...currentValues,
			newSize,
		]);
	};

	// Hàm xử lý xóa size
	const handleRemoveSize = (variantIndex: number, sizeIndex: number) => {
		// Lấy giá trị hiện tại của variant sizes từ form
		const currentVariant = control._formValues.variants[variantIndex];
		const sizeToRemove = currentVariant.variant_details[sizeIndex];

		// Trừ đi số lượng của size bị xóa khỏi tổng stock quantity
		setStockQuantity((prev) => prev - (Number(sizeToRemove.quantity) || 0));

		const updatedSizes = currentVariant.variant_details.filter(
			(_: VariantSize, idx: number) => idx !== sizeIndex
		);

		// Cập nhật state local
		setVariantSizes((prev) => ({
			...prev,
			[variantIndex]: updatedSizes,
		}));

		// Cập nhật giá trị trong form
		setValue(`variants.${variantIndex}.variant_details`, updatedSizes);
	};

	// Thêm hàm kiểm tra size đã được chọn chưa
	const isSelectedSize = (
		variantIndex: number,
		sizeId: number,
		currentSizeIndex: number
	) => {
		const variant = control._formValues.variants[variantIndex];
		return variant.variant_details.some(
			(size: VariantSize, index: number) =>
				index !== currentSizeIndex &&
				Number(size.size_id) === Number(sizeId)
		);
	};

	// Thêm hàm xử lý khi chọn variant images
	const handleVariantImagesChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		variantIndex: number
	) => {
		event.preventDefault();
		const files = event.target.files;
		if (files) {
			const filesArray = Array.from(files);
			setVariantImageFiles((prev) => ({
				...prev,
				[variantIndex]: [...(prev[variantIndex] || []), ...filesArray],
			}));

			// Cập nhật giá trị cho form
			setValue(
				`variants.${variantIndex}.image`,
				filesArray[0].name // Tạm thời lấy tên file đu tiên
			);
			clearErrors(`variants.${variantIndex}.image`);
		}
	};

	// Thêm hàm xóa variant image
	const removeVariantImage = (variantIndex: number, imageIndex: number) => {
		setVariantImageFiles((prev) => {
			const newFiles = {
				...prev,
				[variantIndex]: prev[variantIndex].filter(
					(_, i) => i !== imageIndex
				),
			};

			// Cập nhật lại giá trị form nếu không còn ảnh nào
			if (newFiles[variantIndex].length === 0) {
				setValue(`variants.${variantIndex}.image`, '');
			} else {
				setValue(
					`variants.${variantIndex}.image`,
					newFiles[variantIndex][0] instanceof File
						? newFiles[variantIndex][0].name
						: newFiles[variantIndex][0]
				);
			}

			return newFiles;
		});
	};

	// Add click outside handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Update the description state handler
	const handleDescriptionChange = (value: string) => {
		setDescription(value);
		// Update the form value
		setValue('description', value);
		// Clear description error if value is not empty
		if (value) {
			clearErrors('description');
		}
	};

	return loadingData ? (
		<div className="flex justify-center items-center h-screen">
			<LoadingIcon size="lg" color="primary" type="spinner" />
		</div>
	) : (
		<>
			<div className="w-full border border-stroke p-4 shadow-lg">
				<div className="flex items-center gap-2">
					<Link to="/admin/product">
						<ArrowLeft size={20} />
					</Link>
					<h3 className="font-bold text-2xl">Update Product</h3>
				</div>
				<div className="w-full">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="grid grid-cols-3 gap-x-4 gap-y-5 w-full"
					>
						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Product Name
								</span>
							</div>
							<input
								{...register('name')}
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
							{errors.name && (
								<p className="text-red-500 text-xs">
									{errors.name.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">Price</span>
							</div>
							<input
								{...register('price')}
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
							{errors.price && (
								<p className="text-red-500 text-xs">
									{errors.price.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Promotion Price
								</span>
							</div>
							<input
								{...register('promotional_price')}
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
							{errors.promotional_price && (
								<p className="text-red-500 text-xs">
									{errors.promotional_price.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Stock Quantity
								</span>
							</div>
							<input
								value={stockQuantity}
								type="disabled"
								placeholder="Type here"
								className="input input-bordered w-full bg-gray-200"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">SKU</span>
							</div>
							<input
								{...register('sku')}
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
							{errors.sku && (
								<p className="text-red-500 text-xs">
									{errors.sku.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Hashtag
								</span>
							</div>
							<input
								{...register('hagtag')}
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
							{errors.hagtag && (
								<p className="text-red-500 text-xs">
									{errors.hagtag.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">Status</span>
							</div>
							<select
								{...register('status')}
								className="select select-bordered w-full"
							>
								<option>Select Status</option>
								<option value={Status.PUBLIC}>Public</option>
								<option value={Status.UNPUBLIC}>Unpublic</option>
								<option value={Status.HIDDEN}>Hidden</option>
							</select>
							{errors.status && (
								<p className="text-red-500 text-xs">
									{errors.status.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">Brand</span>
							</div>
							<select
								{...register('brand_id')}
								className="select select-bordered w-full"
							>
								<option defaultValue="Select Brand">
									Select Brand
								</option>
								{brands.map((brand) => (
									<option key={brand.id} value={brand.id}>
										{brand.name}
									</option>
								))}
							</select>
							{errors.brand_id && (
								<p className="text-red-500 text-xs">
									{errors.brand_id.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Select Categories
								</span>
							</div>
							<div className="flex flex-col gap-2">
								<div
									className="dropdown w-full relative"
									ref={dropdownRef}
								>
									<div className="flex justify-between gap-2">
										<div className="w-full min-h-12 border-2 border-gray-300 rounded-md p-2 flex flex-wrap gap-1">
											{selectedCategories.map((category) => (
												<div
													key={category.id}
													className="bg-[#BCDDFE] text-primary px-2 py-1 rounded-md flex items-center gap-1 text-xs"
												>
													<span>{category.name}</span>
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															removeCategory(
																Number(category.id)
															);
														}}
														className="hover:text-primary/80"
													>
														<X size={14} />
													</button>
												</div>
											))}
										</div>
										<div
											role="button"
											className="btn w-fit border border-gray-300 rounded-md z-[10] h"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setIsDropdownOpen(!isDropdownOpen);
											}}
										>
											<Logs size={16} />
										</div>
									</div>

									{isDropdownOpen && (
										<div className="absolute top-full left-0 w-full mt-1 p-2 shadow border border-gray-300 rounded-md z-[1] bg-base-100 max-h-[200px] overflow-y-auto overflow-x-hidden">
											<ul className="menu">
												{categories
													.filter(
														(cat) =>
															!selectedCategories.some(
																(selected) =>
																	Number(selected.id) ===
																	Number(cat.id)
															)
													)
													.map((category) => (
														<li
															className="hover:bg-gray-100 rounded-none w-full whitespace-normal"
															key={category.id}
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																handleCategoryChange(
																	Number(category.id)
																);
															}}
														>
															<button
																type="button"
																className="w-full text-left whitespace-normal"
															>
																{category.name}
															</button>
														</li>
													))}
											</ul>
										</div>
									)}
								</div>
							</div>
							{errors.category_ids && (
								<span className="text-red-500 text-xs">
									{errors.category_ids.message}
								</span>
							)}
						</label>

						<label className="form-control col-span-1 w-fit">
							<div className="label">
								<span className="label-text font-semibold">
									Thumbnail
								</span>
							</div>
							<input
								{...register('thumbnail')} // Add this
								ref={fileInputRef}
								type="file"
								className="hidden"
								onChange={handleFileChange}
								accept="image/*"
							/>
							<div className="flex gap-2">
								{thumbnailFile ? (
									<div className="relative size-[200px] group">
										<img
											src={
												thumbnailFile instanceof File
													? URL.createObjectURL(thumbnailFile)
													: thumbnailFile
											}
											alt="Thumbnail"
											className="w-full h-full object-cover rounded-md border border-gray-300"
										/>
										<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													openModal(
														thumbnailFile instanceof File
															? URL.createObjectURL(
																	thumbnailFile
															  )
															: thumbnailFile
													);
												}}
												className="bg"
											>
												<Eye color="white" size={16} />
											</button>
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													removeThumbnail();
												}}
												className="bg"
											>
												<TrashIcon color="white" size={16} />
											</button>
										</div>
									</div>
								) : (
									<div className="flex flex-col gap-2">
										<div
											onClick={(e) => handleUploadClick(e)}
											className="size-[200px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
										>
											<Upload />
											<p className="text-xs text-gray-500">
												Upload Image
											</p>
										</div>
										{errors.thumbnail && (
											<span className="text-red-500 text-xs">
												{errors.thumbnail.message}
											</span>
										)}
									</div>
								)}
							</div>
						</label>

						<label className="form-control col-span-2 z-[0]">
							<div className="label">
								<span className="label-text font-semibold">
									Description
								</span>
							</div>
							<RichTextEditor
								initialValue={description}
								onChange={handleDescriptionChange}
								height={300}
							/>
							{errors.description && (
								<p className="text-red-500 text-xs">
									{errors.description.message}
								</p>
							)}
						</label>

						<div className="col-span-3">
							<h3 className="text-lg font-bold">Variant</h3>
							{errors.variants && (
								<span className="label-text text-red-500 text-xs ms-2">
									{errors.variants.root?.message ||
										errors.variants?.message}
								</span>
							)}
						</div>

						{fields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-3 col-span-3 gap-4 w-full border-2 border-gray-300 rounded-md p-2"
							>
								<div className="col-span-1 p-2 border border-gray-300 rounded-md">
									<div className="label">
										<span className="label-text font-bold">
											Color
										</span>
										{errors.variants?.[index]?.color_id && (
											<span className="label-text text-red-500 text-xs">
												{errors.variants[index].color_id?.message}
											</span>
										)}
									</div>
									<div className="dropdown w-full">
										<div className="w-full">
											<input
												tabIndex={0}
												disabled={
													!!product?.variants?.[index]?.sizes?.[0]
														?.product_variant_id
												}
												role="button"
												type="text"
												placeholder="Select color"
												className="input input-bordered input-sm w-full"
												value={colorSearchTerms[index] || ''}
												onChange={(e) =>
													setColorSearchTerms((prev) => ({
														...prev,
														[index]: e.target.value,
													}))
												}
												onClick={(e) => e.stopPropagation()}
											/>
										</div>
										<ul
											tabIndex={0}
											className="dropdown-content menu p-2 shadow bg-base-100 w-full max-h-[200px] overflow-y-auto"
										>
											{colors
												.filter((color) =>
													color.color
														.toLowerCase()
														.includes(
															(
																colorSearchTerms[index] || ''
															).toLowerCase()
														)
												)
												.map((color) => (
													<li key={color.id}>
														<button
															type="button"
															onClick={() => {
																setValue(
																	`variants.${index}.color_id`,
																	color.id!
																);
																setColorSearchTerms((prev) => ({
																	...prev,
																	[index]: color.color,
																}));
															}}
															className="flex items-center gap-2"
														>
															<img
																src={color.link_image}
																alt={color.color}
																className="size-4 rounded-full"
															/>
															{color.color}
														</button>
													</li>
												))}
										</ul>
									</div>
								</div>
								<div className="col-span-1 p-2 border border-gray-300 rounded-md">
									<label className="form-control col-span-1 w-fit">
										<div className="label flex justify-between">
											<span className="label-text font-bold">
												Images
											</span>
											{errors.variants?.[index]?.image && (
												<span className="label-text text-red-500 text-xs ms-2">
													{errors.variants[index].image?.message}
												</span>
											)}
										</div>
										<input
											ref={(el) =>
												(variantImagesInputRefs.current[index] = el)
											}
											type="file"
											className="hidden"
											onChange={(e) =>
												handleVariantImagesChange(e, index)
											}
											accept="image/*"
											multiple
										/>
										<div className="flex flex-wrap gap-2">
											<div
												onClick={(e) =>
													handleVariantImagesUploadClick(e, index)
												}
												className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
											>
												<Upload />
												<p className="text-xs text-gray-500">
													Add Images
												</p>
											</div>
											{variantImageFiles[index]?.map(
												(image, imageIndex) => (
													<div
														key={imageIndex}
														className="relative size-[100px] group"
													>
														<img
															src={
																image instanceof File
																	? URL.createObjectURL(image)
																	: image
															}
															alt={`Variant ${index + 1} - ${
																imageIndex + 1
															}`}
															className="w-full h-full object-cover rounded-md border border-gray-300"
														/>
														<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
															<button
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	openModal(
																		image instanceof File
																			? URL.createObjectURL(
																					image
																			  )
																			: image
																	);
																}}
																className="bg"
															>
																<Eye color="white" size={16} />
															</button>
															<button
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	removeVariantImage(
																		index,
																		imageIndex
																	);
																}}
																className="bg"
															>
																<TrashIcon
																	color="white"
																	size={16}
																/>
															</button>
														</div>
													</div>
												)
											)}
										</div>
									</label>
								</div>
								<div className="col-span-1 flex flex-col gap-2 p-2 border border-gray-300 rounded-md">
									<div className="label">
										<span className="label-text font-bold">
											Size and Quantity
										</span>
										{errors.variants?.[index]?.variant_details && (
											<span className="label-text text-red-500 text-xs ms-2">
												{errors.variants[index].variant_details.root
													?.message ||
													errors.variants[index].variant_details
														?.message}
											</span>
										)}
									</div>
									<div className="flex flex-col gap-2 w-full">
										{(variantSizes[index] || []).map(
											(_, sizeIndex) => (
												<>
													<div
														key={sizeIndex}
														className="flex gap-2 w-full"
													>
														<select
															className="select select-bordered select-sm"
															{...register(
																`variants.${index}.variant_details.${sizeIndex}.size_id`
															)}
														>
															<option value="0">
																Select size
															</option>
															{sizes.map((size) => {
																const isDisabled =
																	isSelectedSize(
																		index,
																		Number(size.id),
																		sizeIndex
																	);
																return (
																	<option
																		className="font-semibold"
																		key={size.id}
																		value={Number(size.id)}
																		disabled={isDisabled}
																	>
																		{size.size}
																	</option>
																);
															})}
														</select>
														<input
															type="text"
															placeholder="Quantity"
															className="input input-bordered input-sm w-full"
															{...register(
																`variants.${index}.variant_details.${sizeIndex}.quantity`
															)}
															onChange={(e) => {
																const inputPath = `variants.${index}.variant_details.${sizeIndex}.quantity`;
																const newValue =
																	Number(e.target.value) || 0;
																const oldValue =
																	previousValues[inputPath] ||
																	0;

																setStockQuantity(
																	(prev) =>
																		prev - oldValue + newValue
																);
																setPreviousValues((prev) => ({
																	...prev,
																	[inputPath]: newValue,
																}));
															}}
														/>
														<button
															type="button"
															onClick={() =>
																handleRemoveSize(
																	index,
																	sizeIndex
																)
															}
															className="btn btn-sm btn-error"
														>
															<TrashIcon
																size={16}
																color="white"
																className="z-10"
															/>
														</button>
													</div>
													{errors.variants?.[index]
														?.variant_details?.[sizeIndex]
														?.size_id && (
														<span className="label-text text-red-500 text-xs ms-2">
															{
																errors.variants[index]
																	.variant_details[sizeIndex]
																	?.size_id?.message
															}
														</span>
													)}
													{errors.variants?.[index]
														?.variant_details?.[sizeIndex]
														?.quantity && (
														<span className="label-text text-red-500 text-xs ms-2">
															{
																errors.variants[index]
																	.variant_details[sizeIndex]
																	?.quantity?.message
															}
														</span>
													)}
												</>
											)
										)}
										<button
											type="button"
											onClick={() => handleAddSize(index)}
											className="btn btn-sm w-fit ms-auto"
										>
											Add size
										</button>
									</div>
								</div>
								{!product?.variants?.[index]?.sizes?.[0]
									?.product_variant_id && (
									<button
										type="button"
										onClick={() => removeVariant(index)}
										className="btn bg-red-500	 btn-sm col-span-3 text-white"
									>
										<TrashIcon size={16} color="white" /> Delete
										Variant
									</button>
								)}
							</div>
						))}

						<button
							type="button"
							onClick={addVariant}
							className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary w-fit"
						>
							Add Variant
						</button>

						<button
							disabled={loading}
							type="submit"
							className="btn mt-4 col-span-3 bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
						>
							{loading ? (
								<>
									<span className="loading loading-spinner loading-sm text-info"></span>
									Updating product...
								</>
							) : (
								'Update product'
							)}
						</button>
					</form>
				</div>
			</div>

			{/* Add this dialog for image preview */}
			<dialog ref={modalRef} className="modal">
				{previewImage && (
					<div className="modal-box">
						<img src={previewImage} alt="Preview" className="w-full" />
						<button
							onClick={closeModal}
							className="btn btn-sm absolute right-2 top-2 border border-gray-300 rounded-md"
						>
							<X size={16} />
						</button>
					</div>
				)}
			</dialog>
		</>
	);
};

export default UpdateProduct;
