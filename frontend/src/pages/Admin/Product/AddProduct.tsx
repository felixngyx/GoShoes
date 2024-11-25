import React, { useState, useRef, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Status } from '.';
import categoryService, { CATEGORY } from '../../../services/admin/category';
import sizeService, { SIZE } from '../../../services/admin/size';
import brandService, { BRAND } from '../../../services/admin/brand';
import productService, { PRODUCT } from '../../../services/admin/product';
import toast from 'react-hot-toast';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import uploadImageToCloudinary from '../../../common/uploadCloudinary';
import { useNavigate } from 'react-router-dom';
import { COLOR } from '../../../services/admin/color';
import colorService from '../../../services/admin/color';
import { Eye, TrashIcon, Logs, Upload, X } from 'lucide-react';
import LoadingIcon from '../../../components/common/LoadingIcon';

type PRODUCT_UPLOAD = {
	name: string;
	price: number;
	promotional_price: number;
	status: 'public' | 'unpublic' | 'hidden';
	sku: string;
	hagtag: string;
	stock_quantity: number;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	description: string;
	variants: {
		color_id: number;
		image_variant: string;
		sku: string;
		size: {
			size_id: number;
			quantity: number;
		}[];
	}[];
};

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
				image_variant: Joi.string().required().messages({
					'string.empty': 'Variant image cannot be empty',
					'any.required': 'Variant image is required',
				}),
				sku: Joi.string().allow('').optional(),
				size: Joi.array()
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
};

const AddProduct = () => {
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [sizes, setSizes] = useState<SIZE[]>([]);
	const [brands, setBrands] = useState<BRAND[]>([]);
	const [colors, setColors] = useState<COLOR[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<CATEGORY[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [stockQuantity, setStockQuantity] = useState(0);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		control,
		clearErrors,
		setValue,
		formState: { errors },
	} = useForm<PRODUCT_UPLOAD>({
		resolver: joiResolver(productSchema),
		defaultValues: {
			variants: [
				{
					color_id: 0,
					image_variant: '',
					sku: '',
					size: [
						{
							size_id: 0,
							quantity: 0,
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

	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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
		[key: number]: File[];
	}>({});

	// Thêm state để lưu giá trị trước đó
	const [previousValues, setPreviousValues] = useState<{
		[key: string]: number;
	}>({});

	useEffect(() => {
		(async () => {
			try {
				setLoadingData(true);
				const [resCategory, resSize, resBrand, resColor] =
					await Promise.all([
						categoryService.getAll(),
						sizeService.getAll(),
						brandService.getAll(),
						colorService.getAll(),
					]);

				setCategories(resCategory.data?.categories?.data || []);
				setSizes(resSize.data?.sizes?.data || []);
				setBrands(resBrand.data?.data?.brands || []);
				setColors(resColor.data?.clors?.data || []);

				// Khởi tạo variantSizes cho variant mặc định
				setVariantSizes({
					0: [{ size_id: 0, quantity: 0 }],
				});
			} catch (error) {
				console.error('Error:', error);
				toast.error('Lỗi khi tải dữ liệu');
			} finally {
				setLoadingData(false);
			}
		})();
	}, []);

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
		setThumbnailFile(null);
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
			image_variant: '',
			sku: '',
			size: [
				{
					size_id: 0,
					quantity: 0,
				},
			],
		});

		const newIndex = fields.length;

		// Khởi tạo state cho variant mới với giá trị mặc định
		setVariantSizes((prev) => ({
			...prev,
			[newIndex]: [{ size_id: 0, quantity: 0 }],
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

	const onSubmit = async (data: PRODUCT_UPLOAD) => {
		try {
			setLoading(true);

			const thumbnailName = thumbnailFile?.name || '';

			// Xử lý variants để format image_variant thành chuỗi
			const formattedData = {
				...data,
				thumbnail: thumbnailName,
				variants: data.variants.map((variant, index) => {
					const imageNames =
						variantImageFiles[index]
							?.map((file) => file.name)
							.join(', ') || '';

					return {
						...variant,
						image_variant: imageNames,
					};
				}),
			};

			// Tính toán stock_quantity từ tổng số lượng các variant
			formattedData.stock_quantity = stockQuantity;

			console.log('Formatted submit data:', formattedData);

			// TODO: Gọi API để tạo sản phẩm
			// await productService.create(formattedData);

			// toast.success('Tạo sản phẩm thành công!');
			// navigate('/admin/products');
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Có lỗi xảy ra khi tạo sản phẩm');
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
	const handleAddSize = (variantIndex: number) => {
		const newSize: VariantSize = {
			size_id: 0,
			quantity: 0,
		};

		// Lấy giá trị hiện tại từ form thay vì fields
		const currentValues =
			control._formValues.variants[variantIndex].size || [];

		setVariantSizes((prev) => ({
			...prev,
			[variantIndex]: [...(prev[variantIndex] || []), newSize],
		}));

		// Cập nhật form với giá trị hiện tại + size mới
		setValue(`variants.${variantIndex}.size`, [...currentValues, newSize]);
	};

	// Hàm xử lý xóa size
	const handleRemoveSize = (variantIndex: number, sizeIndex: number) => {
		// Lấy giá trị hiện tại của variant sizes từ form
		const currentVariant = control._formValues.variants[variantIndex];
		const sizeToRemove = currentVariant.size[sizeIndex];

		// Trừ đi số lượng của size bị xóa khỏi tổng stock quantity
		setStockQuantity((prev) => prev - (Number(sizeToRemove.quantity) || 0));

		const updatedSizes = currentVariant.size.filter(
			(_: VariantSize, idx: number) => idx !== sizeIndex
		);

		// Cập nhật state local
		setVariantSizes((prev) => ({
			...prev,
			[variantIndex]: updatedSizes,
		}));

		// Cập nhật giá trị trong form
		setValue(`variants.${variantIndex}.size`, updatedSizes);
	};

	// Thêm hàm kiểm tra size đã được chọn chưa
	const isSelectedSize = (
		variantIndex: number,
		sizeId: number,
		currentSizeIndex: number
	) => {
		const variant = control._formValues.variants[variantIndex];
		return variant.size.some(
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
				`variants.${variantIndex}.image_variant`,
				filesArray[0].name // Tạm thời lấy tên file đầu tiên
			);
			clearErrors(`variants.${variantIndex}.image_variant`);
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
				setValue(`variants.${variantIndex}.image_variant`, '');
			} else {
				setValue(
					`variants.${variantIndex}.image_variant`,
					newFiles[variantIndex][0].name
				);
			}

			return newFiles;
		});
	};

	return loadingData ? (
		<div className="flex justify-center items-center h-screen">
			<LoadingIcon size="lg" color="primary" type="spinner" />
		</div>
	) : (
		<>
			<div className="w-full border border-stroke p-4 shadow-lg">
				<h3 className="font-bold text-2xl">Add Product</h3>
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
								<div className="dropdown w-full relative">
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
														removeCategory(Number(category.id));
													}}
													className="hover:text-primary/80"
												>
													<X size={14} />
												</button>
											</div>
										))}
									</div>

									<div
										tabIndex={0}
										role="button"
										className="btn btn-sm w-fit absolute right-2 top-2 border border-gray-300 rounded-md"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
									>
										<Logs size={16} />
									</div>
									<ul
										tabIndex={0}
										className="dropdown-content menu bg-base-100 w-full mt-1 p-2 shadow border border-gray-300 rounded-md z-[1] flex flex-col"
									>
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
													className="hover:bg-gray-100 rounded-none"
													key={category.id}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleCategoryChange(
															Number(category.id)
														);
													}}
												>
													<button type="button">
														{category.name}
													</button>
												</li>
											))}
									</ul>
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
									<div className="relative size-[150px] group">
										<img
											src={URL.createObjectURL(thumbnailFile)}
											alt="Thumbnail"
											className="w-full h-full object-cover rounded-md"
										/>
										<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													openModal(
														URL.createObjectURL(thumbnailFile)
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
											className="size-[150px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
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

						<label className="form-control col-span-2">
							<div className="label">
								<span className="label-text font-semibold">
									Description
								</span>
							</div>
							<textarea
								rows={5}
								{...register('description')}
								className="textarea textarea-bordered"
								placeholder="Type here"
							></textarea>
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
											{errors.variants?.[index]?.image_variant && (
												<span className="label-text text-red-500 text-xs ms-2">
													{
														errors.variants[index].image_variant
															?.message
													}
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
															src={URL.createObjectURL(image)}
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
																		URL.createObjectURL(image)
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
										{errors.variants?.[index]?.size && (
											<span className="label-text text-red-500 text-xs ms-2">
												{errors.variants[index].size.root
													?.message ||
													errors.variants[index].size?.message}
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
																`variants.${index}.size.${sizeIndex}.size_id`
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
																`variants.${index}.size.${sizeIndex}.quantity`
															)}
															onChange={(e) => {
																const inputPath = `variants.${index}.size.${sizeIndex}.quantity`;
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
													{errors.variants?.[index]?.size?.[
														sizeIndex
													]?.size_id && (
														<span className="label-text text-red-500 text-xs ms-2">
															{
																errors.variants[index].size[
																	sizeIndex
																]?.size_id?.message
															}
														</span>
													)}
													{errors.variants?.[index]?.size?.[
														sizeIndex
													]?.quantity && (
														<span className="label-text text-red-500 text-xs ms-2">
															{
																errors.variants[index].size[
																	sizeIndex
																]?.quantity?.message
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
								<button
									type="button"
									onClick={() => removeVariant(index)}
									className="btn bg-red-500	 btn-sm col-span-3 text-white"
								>
									<TrashIcon size={16} color="white" />
									Delete Variant
								</button>
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
									Creating product...
								</>
							) : (
								'Add product'
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
							className="btn btn-sm btn-circle absolute right-2 top-2"
						>
							<X />
						</button>
					</div>
				)}
			</dialog>
		</>
	);
};

export default AddProduct;
