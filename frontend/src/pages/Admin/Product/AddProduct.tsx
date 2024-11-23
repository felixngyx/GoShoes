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

type PRODUCT_UPLOAD = {
	name: string;
	price: number;
	promotional_price: number;
	status: 'public' | 'unpublic' | 'hidden';
	sku: string;
	hagtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	images: string[];
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
	images: Joi.array().items(Joi.string()).min(1).required().messages({
		'array.base': 'Product image must be an array',
		'array.min': 'Must have at least one product image',
		'any.required': 'Product image is required',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Description cannot be empty',
		'any.required': 'Description is required',
	}),
	variants: Joi.array()
		.items(
			Joi.object({
				color_id: Joi.number().required().messages({
					'any.required': 'Color is required',
				}),
				image_variant: Joi.string().required().messages({
					'string.empty': 'Variant image cannot be empty',
					'any.required': 'Variant image is required',
				}),
				size: Joi.array()
					.items(
						Joi.object({
							size_id: Joi.number().required().messages({
								'number.base': 'Size ID must be a number',
								'any.required': 'Size ID is required',
							}),
							quantity: Joi.number().min(0).required().messages({
								'number.base': 'Số lượng phải là số',
								'number.min': 'Quantity cannot be negative',
								'any.required': 'Quantity is required',
							}),
						})
					)
					.min(1)
					.required()
					.messages({
						'array.min': 'Must have at least one size',
						'any.required': 'Size is required',
					}),
			})
		)
		.required()
		.messages({
			'array.base': 'Variant must be an array',
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

	const productImagesInputRef = useRef<HTMLInputElement>(null);

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const [productImageFiles, setProductImageFiles] = useState<File[]>([]);

	// Thêm state để quản lý sizes cho từng variant
	const [variantSizes, setVariantSizes] = useState<{
		[key: number]: VariantSize[];
	}>({});

	// Thêm state để quản lý search
	const [colorSearchTerm, setColorSearchTerm] = useState<string>('');

	// Thêm hàm lọc colors
	const filteredColors = colors.filter((color) =>
		color.color.toLowerCase().includes(colorSearchTerm.toLowerCase())
	);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
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
				setLoading(false);
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

	const handleProductImagesChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		event.preventDefault();
		const files = event.target.files;
		if (files) {
			const filesArray = Array.from(files);
			setProductImageFiles((prev) => [...prev, ...filesArray]);
			setValue(
				'images',
				[...productImageFiles, ...filesArray].map((file) => file.name)
			);
			clearErrors('images');
		}
	};

	const removeProductImage = (index: number) => {
		setProductImageFiles((prev) => {
			const newFiles = prev.filter((_, i) => i !== index);
			setValue(
				'images',
				newFiles.map((file) => file.name)
			);
			return newFiles;
		});
	};

	const handleProductImagesUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		productImagesInputRef.current?.click();
	};

	// Modify the append function to also add a null image
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
	};

	// Modify the remove function to also remove the corresponding image
	const removeVariant = (index: number) => {
		remove(index);
	};

	const onSubmit = async (data: PRODUCT_UPLOAD) => {};

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
		setVariantSizes((prev) => ({
			...prev,
			[variantIndex]: prev[variantIndex].filter(
				(_, idx) => idx !== sizeIndex
			),
		}));

		// Cập nhật giá trị trong form
		const currentSizes = fields[variantIndex].size || [];
		setValue(
			`variants.${variantIndex}.size`,
			currentSizes.filter((_, idx) => idx !== sizeIndex)
		);
	};

	return (
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
								<span className="label-text">Product Name</span>
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
								<span className="label-text">Price</span>
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
								<span className="label-text">Promotion Price</span>
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
								<span className="label-text">Stock Quantity</span>
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
								<span className="label-text">SKU</span>
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
								<span className="label-text">Hashtag</span>
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
								<span className="label-text">Status</span>
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
								<span className="label-text">Brand</span>
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
								<span className="label-text">Select Categories</span>
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
								<span className="label-text">Thumbnail</span>
								{errors.thumbnail && (
									<span className="text-red-500 text-xs">
										{errors.thumbnail.message}
									</span>
								)}
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
									<div className="relative size-[100px] group">
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
									<div
										onClick={(e) => handleUploadClick(e)}
										className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
									>
										<Upload />
										<p className="text-xs text-gray-500">
											Upload Image
										</p>
									</div>
								)}
							</div>
						</label>

						{/* New section for product images */}
						<label className="form-control col-span-1 w-fit">
							<div className="label">
								<span className="label-text">Product Images</span>
								{errors.images && (
									<span className="text-red-500 text-xs">
										{errors.images.message}
									</span>
								)}
							</div>
							<input
								ref={productImagesInputRef}
								type="file"
								className="hidden"
								onChange={handleProductImagesChange}
								accept="image/*"
								multiple
							/>
							<div className="flex flex-wrap gap-2">
								<div
									onClick={(e) => handleProductImagesUploadClick(e)}
									className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
								>
									<Upload />
									<p className="text-xs text-gray-500">Add Images</p>
								</div>
								{productImageFiles.map((image, index) => (
									<div
										key={index}
										className="relative size-[100px] group"
									>
										<img
											src={URL.createObjectURL(image)}
											alt={`Product ${index + 1}`}
											className="w-full h-full object-cover rounded-md border border-gray-300"
										/>
										<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													openModal(URL.createObjectURL(image));
												}}
												className="bg"
											>
												<Eye color="white" size={16} />
											</button>
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													removeProductImage(index);
												}}
												className="bg"
											>
												<TrashIcon color="white" size={16} />
											</button>
										</div>
									</div>
								))}
							</div>
						</label>

						<label className="form-control col-span-1	">
							<div className="label">
								<span className="label-text">Description</span>
							</div>
							<textarea
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

						<h3 className="text-lg font-bold col-span-3">Variant</h3>

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
									</div>
									<div className="dropdown w-full">
										<div className="w-full">
											<input
												tabIndex={0}
												role="button"
												type="text"
												placeholder="Select color"
												className="input input-bordered input-sm w-full"
												value={colorSearchTerm}
												onChange={(e) =>
													setColorSearchTerm(e.target.value)
												}
												onClick={(e) => e.stopPropagation()}
											/>
										</div>
										<ul
											tabIndex={0}
											className="dropdown-content menu p-2 shadow bg-base-100 w-full max-h-[200px] overflow-y-auto"
										>
											{filteredColors.map((color) => (
												<li key={color.id}>
													<button
														type="button"
														onClick={() => {
															setValue(
																`variants.${index}.color_id`,
																color.id!
															);
															setColorSearchTerm(color.color);
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
										<div className="label">
											<span className="label-text font-bold">
												Image
											</span>
										</div>
										<input
											ref={fileInputRef}
											type="file"
											className="hidden"
											accept="image/*"
										/>
										<div className="flex gap-2">
											<div
												onClick={(e) => handleUploadClick(e)}
												className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
											>
												<Upload />
												<p className="text-xs text-gray-500">
													Upload Image
												</p>
											</div>
										</div>
									</label>
								</div>
								<div className="col-span-1 flex flex-col gap-2 p-2 border border-gray-300 rounded-md">
									<div className="label">
										<span className="label-text font-bold">
											Size and Quantity
										</span>
									</div>
									<div className="flex flex-col gap-2 w-full">
										{(variantSizes[index] || []).map(
											(_, sizeIndex) => (
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
														<option value="0">Select size</option>
														{sizes.map((size) => (
															<option
																key={size.id}
																value={size.id}
															>
																{size.size}
															</option>
														))}
													</select>
													<input
														type="number"
														placeholder="Quantity"
														className="input input-bordered input-sm w-full"
														{...register(
															`variants.${index}.size.${sizeIndex}.quantity`
														)}
													/>
													<button
														type="button"
														onClick={() =>
															handleRemoveSize(index, sizeIndex)
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
