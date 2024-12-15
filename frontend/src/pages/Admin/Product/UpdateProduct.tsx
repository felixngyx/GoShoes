import React, { useState, useRef, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Status } from '../../../constants/status';
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
import axiosClient from '../../../apis/axiosClient';
import { formatVNCurrency } from '../../../common/formatVNCurrency';

// Add form validation schema
const productSchema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Tên sản phẩm không được để trống',
		'any.required': 'Tên sản phẩm không được để trống',
	}),
	price: Joi.number().positive().max(99999999).required().messages({
		'number.base': 'Giá phải là một số',
		'number.max': 'Giá không được vượt quá 99,999,999₫',
		'any.required': 'Giá không được để trống',
	}),
	promotional_price: Joi.alternatives().try(
		Joi.number().max(Joi.ref('price')).max(99999999).messages({
			'number.base': 'Giá khuyến mãi phải là một số',
			'number.max':
				'Giá khuyến mãi phải nhỏ hơn giá gốc và không được vượt quá 99,999,999₫',
		}),
		Joi.valid(null, '')
	),
	status: Joi.string()
		.valid('public', 'unpublic', 'hidden')
		.required()
		.messages({
			'string.empty': 'Trạng thái không được để trống',
			'any.only': 'Trạng thái không hợp lệ',
			'any.required': 'Trạng thái không được để trống',
		}),
	sku: Joi.string().required().messages({
		'string.empty': 'SKU không được để trống',
		'any.required': 'SKU không được để trống',
	}),
	hagtag: Joi.string().required().messages({
		'string.empty': 'Hashtag không được để trống',
		'any.required': 'Hashtag không được để trống',
	}),
	category_ids: Joi.array().items(Joi.number()).min(1).required().messages({
		'array.base': 'Danh mục phải là một mảng',
		'array.min': 'Phải chọn ít nhất một danh mục',
		'any.required': 'Danh mục không được để trống',
	}),
	brand_id: Joi.number().required().messages({
		'number.base': 'Thương hiệu phải là một số',
		'any.required': 'Thương hiệu không được để trống',
	}),
	thumbnail: Joi.string().required().messages({
		'string.empty': 'Thumbnail không được để trống',
		'any.required': 'Thumbnail không được để trống',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Mô tả không được để trống',
		'any.required': 'Mô tả không được để trống',
	}),
	variants: Joi.array()
		.items(
			Joi.object({
				color_id: Joi.number().invalid(0).required().messages({
					'number.invalid': 'Vui lòng chọn màu sắc',
					'any.required': 'Màu sắc không được để trống',
					'number.base': 'Vui lòng chọn màu sắc',
					'any.invalid': 'Vui lòng chọn màu sắc',
				}),
				image: Joi.string().required().messages({
					'string.empty': 'Ảnh biến thể không được để trống',
					'any.required': 'Ảnh biến thể không được để trống',
				}),
				variant_details: Joi.array()
					.items(
						Joi.object({
							size_id: Joi.number().min(1).required().messages({
								'number.base': 'Vui lòng chọn kích thước',
								'number.min': 'Vui lòng chọn kích thước',
								'any.required': 'Vui lòng chọn kích thước',
							}),
							quantity: Joi.number().min(0).required().messages({
								'number.base': 'Số lượng phải là một số',
								'number.min': 'Số lượng phải là số dương',
								'any.required': 'Số lượng không được để trống',
							}),
							sku: Joi.string().allow('').optional(),
						})
					)
					.min(1)
					.required()
					.messages({
						'array.min': 'Phải có ít nhất một kích thước',
						'any.required': 'Kích thước không được để trống',
						'array.base': 'Vui lòng chọn kích thước',
					}),
			})
		)
		.required()
		.min(1)
		.messages({
			'array.base': 'Biến thể phải là một mảng',
			'array.min': 'Phải có ít nhất một biến thể',
			'any.required': 'Biến thể không được để trống',
		}),
});

// Thêm type cho size trong variant
type VariantSize = {
	size_id: number;
	quantity: number;
	sku: string;
	product_variant_id?: number;
};

interface Variant {
	color_id: number;
	image: string;
	variant_details: VariantSize[];
}

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
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef(null);
	const [selectedColor, setSelectedColor] = useState<number[]>([]);

	const {
		register,
		handleSubmit,
		control,
		clearErrors,
		setValue,
		formState: { errors },
		reset,
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

	// Thêm state để kiểm soát việc disable các nút
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch product data
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoadingData(true);

				// Fetch reference data first
				const [brandsRes, categoriesRes, colorsRes, sizesRes] =
					await Promise.all([
						brandService.getAll(1, 1000),
						categoryService.getAll(1, 1000),
						colorService.getAll(1, 1000),
						sizeService.getAll(1, 1000),
					]);

				// Set reference data with correct data structure
				const brandsData = brandsRes.data.data.brands || [];
				const categoriesData = categoriesRes.data.categories.data || [];
				const colorsData = colorsRes.data.clors.data || [];
				console.log(colorsData);
				const sizesData = sizesRes.data.sizes.data || [];

				setBrands(brandsData);
				setCategories(categoriesData);
				setColors(colorsData);
				setSizes(sizesData);

				// Then fetch product data
				const productRes = await axiosClient.get(`/admin/products/${id}`);
				const productData = productRes.data.data;

				if (!productData) {
					throw new Error('Product data not found');
				}

				// Set product data
				setProduct(productData);
				console.log(productData);

				// Process variants data
				const processedVariants =
					productData.variants?.map((variant: Variant) => {
						return {
							color_id: variant.color_id,
							image: variant.image,
							variant_details: variant.variant_details || [],
						};
					}) || [];

				// Set variant images
				const variantImagesMap: { [key: number]: (string | File)[] } = {};
				productData.variants?.forEach((variant: Variant, index: number) => {
					const images = variant.image?.split(', ') || [];
					variantImagesMap[index] = images;
				});
				setVariantImageFiles(variantImagesMap);

				// Set color search terms
				const colorTermsMap: { [key: number]: string } = {};
				productData.variants?.forEach((variant: Variant, index: number) => {
					const color = colorsData.find(
						(c: COLOR) => c.id === variant.color_id
					);
					if (color) {
						colorTermsMap[index] = color.color;
					}
				});
				setColorSearchTerms(colorTermsMap);

				// Set variant sizes
				const variantSizesMap: { [key: number]: VariantSize[] } = {};
				productData.variants?.forEach((variant: Variant, index: number) => {
					variantSizesMap[index] = variant.variant_details || [];
				});
				setVariantSizes(variantSizesMap);

				// Set selected categories
				const selectedCats = categoriesData.filter((cat: CATEGORY) =>
					productData.category_ids?.includes(cat.id)
				);
				setSelectedCategories(selectedCats);

				// Set previous values for quantities
				const prevValues: { [key: string]: number } = {};
				productData.variants?.forEach(
					(variant: Variant, variantIndex: number) => {
						variant.variant_details?.forEach(
							(detail: VariantSize, detailIndex: number) => {
								const key = `variants.${variantIndex}.variant_details.${detailIndex}.quantity`;
								prevValues[key] = detail.quantity;
							}
						);
					}
				);
				setPreviousValues(prevValues);

				// Set selected colors
				const selectedColors = productData.variants?.map(
					(variant: Variant) => variant.color_id
				);
				setSelectedColor(selectedColors || []);

				// Update form with new data
				reset({
					name: productData.name,
					description: productData.description,
					price: Number(formatVNCurrency(productData.price)),
					promotional_price: productData.promotional_price
						? Number(formatVNCurrency(productData.promotional_price))
						: undefined,
					status: productData.status,
					sku: productData.sku,
					hagtag: productData.hagtag,
					brand_id: productData.brand_id,
					category_ids: productData.category_ids,
					thumbnail: productData.thumbnail,
					variants: processedVariants,
				});

				// Set other states
				setDescription(productData.description);
				setThumbnailFile(productData.thumbnail);
				setStockQuantity(productData.stock_quantity);
			} catch (error) {
				console.error('Error fetching data:', error);
				toast.error('Failed to fetch product data');
			} finally {
				setLoadingData(false);
			}
		};

		if (id) {
			fetchData();
		}
	}, [id, reset]);

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
			[`variants.${newIndex}.variant_details.0.quantity`]: 0,
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
		if (currentVariant?.variant_details) {
			currentVariant.variant_details.forEach((detail: VariantSize) => {
				setStockQuantity((prev) => prev - (detail.quantity || 0));
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
				const match = key.match(
					/variants\.(\d+)\.variant_details\.(\d+)\.quantity/
				);
				if (match) {
					const variantIndex = parseInt(match[1]);
					const sizeIndex = match[2];
					if (variantIndex < index) {
						newPrev[key] = value;
					} else if (variantIndex > index) {
						newPrev[
							`variants.${variantIndex - 1
							}.variant_details.${sizeIndex}.quantity`
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

		setSelectedColor((prev) =>
			prev.filter((colorId) => colorId !== currentVariant.color_id)
		);

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
			setIsSubmitting(true);

			const processPrice = (price: string | number) => {
				if (typeof price === 'string') {
					const processedPrice = Number(price.replace(/[.,đ₫]/g, ''));
					// Kiểm tra giới hạn giá
					if (processedPrice > 99000000) {
						throw new Error('Price cannot exceed 99,000,000₫');
					}
					return processedPrice;
				}
				// Kiểm tra giới hạn giá cho number
				if (price > 99000000) {
					throw new Error('Price cannot exceed 99,000,000₫');
				}
				return price;
			};

			const formattedData = {
				...data,
				price: processPrice(data.price),
				promotional_price: data.promotional_price
					? processPrice(data.promotional_price)
					: null,
				is_deleted: false,
				slug: generateSlug(data.name),
				thumbnail: thumbnailFile,
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
								const size = sizes.find(
									(s) => Number(s.id) === Number(detail.size_id)
								);
								const sizeName = size ? size.size : '';
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

			const response = await axiosClient.put(
				`/products/${id}`,
				formattedData
			);
			console.log('Response:', response);
			if (response.status.toString() === '201') {
				toast.success('Update product successfully!');
			}
		} catch (error: unknown) {
			console.error('Error submitting form:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update product';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
			setIsSubmitting(false);
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

		// Ly giá trị hiện tại từ variant_details thay vì sizes
		const currentValues =
			control._formValues.variants[variantIndex].variant_details || [];

		// Cập nhật stockQuantity khi thêm size mi
		setStockQuantity((prev) => prev + newSize.quantity);

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
		const quantityToRemove = Number(sizeToRemove.quantity) || 0;
		setStockQuantity((prev) => prev - quantityToRemove);

		// Xóa giá trị quantity cũ khỏi previousValues và cập nhật lại index cho các size còn lại
		setPreviousValues((prev) => {
			const newPrev = { ...prev };
			// Xa giá trị của size b xóa
			delete newPrev[
				`variants.${variantIndex}.variant_details.${sizeIndex}.quantity`
			];

			// Cập nhật lại index cho các size phía sau
			const remainingSizes = currentVariant.variant_details.length;
			for (let i = sizeIndex + 1;i < remainingSizes;i++) {
				const oldKey = `variants.${variantIndex}.variant_details.${i}.quantity`;
				const newKey = `variants.${variantIndex}.variant_details.${i - 1
					}.quantity`;
				newPrev[newKey] = newPrev[oldKey];
				delete newPrev[oldKey];
			}

			return newPrev;
		});

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
	// Hàm kiểm tra màu đã được chọn chưa
	// const isSelectedColor = (colorId: number, currentVariantIndex: number) => {
	// 	return fields.some(
	// 		(field, index) =>
	// 			index !== currentVariantIndex && field.color_id === colorId
	// 	);
	// };

	// Thêm hàm xử lý input số
	const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Chỉ cho phép số và dấu chấm
		if (!/^\d*\.?\d*$/.test(value)) {
			e.target.value = value.replace(/[^\d.]/g, '');
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
					<h3 className="font-bold text-2xl">Cập nhật sản phẩm</h3>
				</div>
				<div className="w-full">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="grid grid-cols-3 gap-x-4 gap-y-5 w-full"
					>
						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">
									Tên sản phẩm
								</span>
							</div>
							<input
								{...register('name')}
								type="text"
								placeholder="Nhập vào đây"
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
								<span className="label-text font-semibold">Giá</span>
							</div>
							<input
								{...register('price')}
								type="number"
								min="0"
								step="any"
								onInput={handleNumberInput}
								placeholder="Nhập vào đây"
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
									Giá khuyến mãi
								</span>
							</div>
							<input
								{...register('promotional_price', {
									setValueAs: (value: string) =>
										value === '' ? null : Number(value),
								})}
								type="number"
								min="0"
								step="any"
								onInput={handleNumberInput}
								placeholder="Nhập vào đây"
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
									Số lượng tồn kho
								</span>
							</div>
							<input
								value={stockQuantity}
								type="disabled"
								placeholder="Nhập vào đây"
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
								placeholder="Nhập vào đây"
								className="input input-bordered w-full uppercase"
								onChange={(e) => {
									// Chỉ cho phép chữ cái không dấu, số và dấu gạch ngang
									const value = e.target.value
										.replace(/[^A-Za-z0-9-]/g, '')
										.toUpperCase();
									e.target.value = value;
									setValue('sku', value);
								}}
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
								placeholder="Nhập vào đây"
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
								<span className="label-text font-semibold">Trạng thái</span>
							</div>
							<select
								{...register('status')}
								className="select select-bordered w-full"
							>
								<option>Chọn trạng thái</option>
								<option value={Status.PUBLIC}>Công khai</option>
								<option value={Status.UNPUBLIC}>Không công khai</option>
								<option value={Status.HIDDEN}>Ẩn</option>
							</select>
							{errors.status && (
								<p className="text-red-500 text-xs">
									{errors.status.message}
								</p>
							)}
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text font-semibold">Thương hiệu</span>
							</div>
							<select
								{...register('brand_id')}
								className="select select-bordered w-full"
								value={product?.brand_id || ''}
							>
								<option value="">Chọn thương hiệu</option>
								{brands &&
									brands.length > 0 &&
									brands.map((brand) => (
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
									Chọn danh mục
								</span>
							</div>
							<div className="flex flex-col gap-2">
								<div
									className="dropdown w-full relative"
									ref={dropdownRef}
								>
									<div className="flex justify-between gap-2">
										<div className="w-full min-h-12 border-2 border-gray-300 rounded-md p-2 flex flex-wrap gap-1">
											{selectedCategories &&
												selectedCategories.length > 0 &&
												selectedCategories.map((category) => (
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
												{categories &&
													categories.length > 0 &&
													categories
														.filter(
															(category) =>
																!selectedCategories.some(
																	(selected) =>
																		selected.id ===
																		category.id
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
									Mô tả
								</span>
							</div>
							<RichTextEditor
								ref={editorRef}
								initialValue={product?.description || ''}
								onChange={(newContent) => {
									setValue('description', newContent);
									setDescription(newContent);
								}}
								key={`editor-${id}`}
							/>
							{errors.description && (
								<p className="text-red-500 text-xs">
									{errors.description.message}
								</p>
							)}
						</label>

						<div className="col-span-3">
							<h3 className="text-lg font-bold">Biến thể</h3>
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
											Màu sắc
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
												role="button"
												type="text"
												disabled={
													product?.variants[index]?.color_id !==
													0 &&
													product?.variants[index]?.color_id !==
													undefined
												}
												placeholder="Chọn màu sắc"
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
										<div className="dropdown-content p-2 shadow bg-base-100 w-full max-h-[200px] overflow-y-auto">
											<ul className="menu" tabIndex={0}>
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
																	setColorSearchTerms(
																		(prev) => ({
																			...prev,
																			[index]: color.color,
																		})
																	);
																	setSelectedColor((prev) => [
																		...prev,
																		color.id!,
																	]);
																}}
																className={`flex items-center gap-2 ${selectedColor.includes(
																	color.id!
																) && 'opacity-50'
																	}`}
																disabled={selectedColor.includes(
																	color.id!
																)}
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
								</div>
								<div className="col-span-1 p-2 border border-gray-300 rounded-md">
									<label className="form-control col-span-1 w-fit">
										<div className="label flex justify-between">
											<span className="label-text font-bold">
												Hình ảnh
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
													Thêm hình ảnh
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
															alt={`Biến thể ${index + 1} - ${imageIndex + 1
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
											Kích thước và số lượng
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
															disabled={
																product?.variants[index]
																	?.variant_details?.[
																	sizeIndex
																]?.size_id !== 0 &&
																product?.variants[index]
																	?.variant_details?.[
																	sizeIndex
																]?.size_id !== undefined
															}
														>
															<option value="0">
																Chọn kích thước
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
															type="number"
															min="0"
															placeholder="Số lượng"
															className="input input-bordered input-sm w-full"
															{...register(
																`variants.${index}.variant_details.${sizeIndex}.quantity`
															)}
															disabled={isSubmitting}
															onInput={handleNumberInput}
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
															disabled={
																isSubmitting ||
																(product?.variants[index]
																	?.variant_details?.[
																	sizeIndex
																]?.size_id !== 0 &&
																	product?.variants[index]
																		?.variant_details?.[
																		sizeIndex
																	]?.size_id !== undefined)
															}
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
											disabled={isSubmitting}
										>
											Thêm kích thước
										</button>
									</div>
								</div>
								{product?.variants[index]?.color_id === 0 ||
									(product?.variants[index]?.color_id ===
										undefined && (
											<button
												type="button"
												onClick={() => removeVariant(index)}
												className="btn bg-red-500	 btn-sm col-span-3 text-white"
												disabled={isSubmitting}
											>
												<TrashIcon size={16} color="white" />{' '}
												<span className="text-xs">Xóa biến thể</span>
											</button>
										))}
							</div>
						))}

						<button
							type="button"
							onClick={addVariant}
							className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary w-fit"
							disabled={isSubmitting}
						>
							Thêm biến thể
						</button>

						<button
							disabled={loading || isSubmitting}
							type="submit"
							className="btn mt-4 col-span-3 bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
						>
							{loading ? (
								<>
									<span className="loading loading-spinner loading-sm text-info"></span>
									Đang cập nhật sản phẩm...
								</>
							) : (
								'Cập nhật sản phẩm'
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
