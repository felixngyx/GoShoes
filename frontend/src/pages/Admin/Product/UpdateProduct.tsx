import { TrashIcon, Upload, Eye, X, Logs } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Status } from '.';
import categoryService, { CATEGORY } from '../../../services/admin/category';
import sizeService, { SIZE } from '../../../services/admin/size';
import brandService, { BRAND } from '../../../services/admin/brand';
import productService, {
	PRODUCT_DETAIL,
} from '../../../services/admin/product';
import toast from 'react-hot-toast';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import uploadImageToCloudinary from '../../../common/uploadCloudinary';
import { useNavigate, useParams } from 'react-router-dom';
import colorService from '../../../services/admin/color';
import { COLOR } from '../../../services/admin/color';
import LoadingIcon from '../../../components/common/LoadingIcon';

const productSchema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Product name is required',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Description is required',
	}),
	price: Joi.number().positive().required().messages({
		'number.base': 'Price must be a number',
		'number.positive': 'Price must be positive',
	}),
	promotional_price: Joi.number()
		.positive()
		.max(Joi.ref('price'))
		.required()
		.messages({
			'number.base': 'Promotional price must be a number',
			'number.positive': 'Promotional price must be positive',
			'number.max': 'Promotional price must be less than regular price',
		}),
	status: Joi.string().required().messages({
		'string.empty': 'Status is required',
	}),
	sku: Joi.string().required().messages({
		'string.empty': 'SKU is required',
	}),
	hagtag: Joi.string().required().messages({
		'string.empty': 'Hashtag is required',
	}),
	category_ids: Joi.array().items(Joi.number()).required().messages({
		'array.base': 'Category is required',
		'array.min': 'At least one category is required',
	}),
	brand_id: Joi.number().required().messages({
		'number.base': 'Brand is required',
	}),
	thumbnail: Joi.string().required().messages({
		'string.empty': 'Thumbnail is required',
	}),
	images: Joi.array()
		.items(
			Joi.object({
				id: Joi.number().optional(),
				image_path: Joi.string().required(),
			})
		)
		.required()
		.messages({
			'array.base': 'Images must be an array',
			'array.min': 'At least one image is required',
		}),
	stock_quantity: Joi.number().min(1).required().messages({
		'number.min': 'Stock quantity must be at least 1',
		'number.base': 'Stock quantity must be a number',
	}),
	variants: Joi.array()
		.items(
			Joi.object({
				color_id: Joi.number().required().messages({
					'number.base': 'Color is required',
				}),
				size_id: Joi.number().required().messages({
					'number.base': 'Size is required',
				}),
				quantity: Joi.number().min(1).required().messages({
					'number.min': 'Quantity must be at least 1',
					'number.base': 'Quantity must be a number',
				}),
			})
		)
		.allow(''),
});
const UpdateProduct = () => {
	const { id } = useParams();
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [sizes, setSizes] = useState<SIZE[]>([]);
	const [brands, setBrands] = useState<BRAND[]>([]);
	const [colors, setColors] = useState<COLOR[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<CATEGORY[]>([]);
	const [initialData, setInitialData] = useState<PRODUCT_DETAIL | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const fetchProduct = async () => {
		try {
			// Fetch all necessary data first
			const [resCategory, resSize, resBrand, resColor, productRes] =
				await Promise.all([
					categoryService.getAll(),
					sizeService.getAll(),
					brandService.getAll(),
					colorService.getAll(),
					productService.getById(Number(id)),
				]);

			// Set all the data
			const categories = resCategory.data.category.data;
			setCategories(categories);
			setSizes(resSize.data.sizes.data);
			setBrands(resBrand.data.brands.data);
			setColors(resColor.data.clors.data);

			const product = productRes;
			setInitialData(product);

			// Set form values
			setValue('name', product.name);
			setValue('description', product.description);
			setValue('price', Number(product.price));
			setValue('promotional_price', Number(product.promotional_price));
			setValue('status', product.status);
			setValue('sku', product.sku);
			setValue('hagtag', product.hagtag);
			setValue('brand_id', product.brand_id);
			setValue('thumbnail', product.thumbnail);
			setValue('images', product.images);
			setValue('stock_quantity', Number(product.stock_quantity));

			// Now we can safely handle categories since we have both product and categories data
			if (product.category_ids && Array.isArray(product.category_ids)) {
				const selectedCategories = categories.filter((cat: CATEGORY) =>
					product.category_ids.includes(Number(cat.id))
				);
				setSelectedCategories(selectedCategories);
				setValue(
					'category_ids',
					product.category_ids.map((id) => Number(id))
				);
			}

			const productImages = product.images.map(
				(image: { image_path: string }) => image.image_path
			);
			setProductImageFiles(productImages);

			if (product.variants && Array.isArray(product.variants)) {
				setValue('variants', product.variants);
			}

			setThumbnailFile(product.thumbnail);
		} catch (error) {
			console.log(error);
			toast.error('Failed to fetch product data');
		}
	};

	const {
		register,
		handleSubmit,
		control,
		clearErrors,
		setValue,
		formState: { errors },
	} = useForm<PRODUCT_DETAIL>({
		resolver: joiResolver(productSchema),
		defaultValues: {
			variants: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'variants',
	});

	const [thumbnailFile, setThumbnailFile] = useState<File | string | null>(
		null
	);
	const modalRef = useRef<HTMLDialogElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const productImagesInputRef = useRef<HTMLInputElement>(null);

	const [variantImageFiles, setVariantImageFiles] = useState<
		(File | string | null)[]
	>([]);

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const [productImageFiles, setProductImageFiles] = useState<
		(File | string)[]
	>([]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
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
				[...productImageFiles, ...filesArray].map((file) => ({
					image_path: file instanceof File ? file.name : file,
				}))
			);
			clearErrors('images');
		}
	};

	const removeProductImage = (index: number) => {
		setProductImageFiles((prev) => {
			const newFiles = prev.filter((_, i) => i !== index);
			setValue(
				'images',
				newFiles.map((file) => ({
					image_path: file instanceof File ? file.name : file,
				}))
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
			size_id: 0,
			quantity: 0,
		});
		setVariantImageFiles([...variantImageFiles, null]);
	};

	// Modify the remove function to also remove the corresponding image
	const removeVariant = (index: number) => {
		remove(index);
		const newFiles = [...variantImageFiles];
		newFiles.splice(index, 1);
		setVariantImageFiles(newFiles);
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

	useEffect(() => {
		if (id) {
			(async () => {
				setLoading(true);
				try {
					await fetchProduct();
				} finally {
					setLoading(false);
				}
			})();
		}
	}, [id]);

	// Add state for initial data

	const onSubmit = async (data: PRODUCT_DETAIL) => {
		try {
			setLoading(true);
			// Show loading toast
			const loadingToast = toast.loading('Updating product...');

			// Log data before sending to backend
			console.log('Final Form Data:', {
				name: data.name,
				description: data.description,
				price: Number(data.price),
				promotional_price: Number(data.promotional_price),
				status: data.status,
				sku: data.sku,
				hagtag: data.hagtag,
				category_ids: selectedCategories.map((cat) => Number(cat.id)),
				brand_id: Number(data.brand_id),
				thumbnail: data.thumbnail,
				images: data.images,
				stock_quantity: Number(data.stock_quantity),
				variants: data.variants,
				rating_count: Number(initialData?.rating_count),
			});

			// Handle thumbnail upload if changed
			let thumbnailUrl = data.thumbnail;
			if (thumbnailFile && thumbnailFile instanceof File) {
				thumbnailUrl = await uploadImageToCloudinary(thumbnailFile);
			}

			// Handle product images
			const uploadedProductImages = await Promise.all(
				productImageFiles.map(async (file) => {
					if (typeof file === 'string') {
						// Return existing image URL
						return { image_path: file };
					}
					if (file instanceof File) {
						const uploadedUrl = await uploadImageToCloudinary(file);
						return { image_path: uploadedUrl };
					}
					return null;
				})
			).then((images) =>
				images.filter((img): img is { image_path: string } => img !== null)
			);

			// Prepare final form data
			const formData = {
				name: data.name,
				description: data.description,
				price: Number(data.price),
				promotional_price: Number(data.promotional_price),
				status: data.status,
				sku: data.sku,
				hagtag: data.hagtag,
				category_ids: selectedCategories.map((cat) => Number(cat.id)),
				brand_id: Number(data.brand_id),
				thumbnail: thumbnailUrl,
				images: uploadedProductImages,
				stock_quantity: Number(data.stock_quantity),
				variants: data.variants,
				rating_count: Number(initialData?.rating_count),
			};

			// Send to backend
			const response = await productService.update(Number(id), formData);

			console.log(response);

			if (response) {
				toast.dismiss(loadingToast);
				toast.success('Product updated successfully');
				navigate('/admin/product');
			}
		} catch (error) {
			console.error('Update error:', error);
			toast.error('Failed to update product. Check console for details.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="w-full border border-stroke p-4 shadow-lg">
				<h3 className="font-bold text-2xl">Update Product</h3>
				<div className="w-full">
					{loading ? (
						<div className="w-full h-full flex items-center justify-center">
							<LoadingIcon size="lg" type="spinner" color="info" />
						</div>
					) : (
						<form
							onSubmit={handleSubmit(onSubmit, (errors) => {
								console.log('Form Validation Errors:', errors);
								toast.error('Please check all required fields');
							})}
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
									{...register('stock_quantity')}
									type="number"
									placeholder="Type here"
									className="input input-bordered w-full"
								/>
								{errors.stock_quantity && (
									<p className="text-red-500 text-xs">
										{errors.stock_quantity.message}
									</p>
								)}
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
									<option defaultValue="Select Status">
										Select Status
									</option>
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
									<option value="">Select Brand</option>
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
											{selectedCategories &&
											selectedCategories.length > 0 ? (
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
												))
											) : (
												<span className="text-gray-500 text-sm">
													Select categories...
												</span>
											)}
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
								{selectedCategories.length === 0 && (
									<span className="text-red-500 text-xs">
										Please select at least one category
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
												src={
													thumbnailFile instanceof File
														? URL.createObjectURL(thumbnailFile)
														: thumbnailFile
												}
												alt="Thumbnail"
												className="w-full h-full object-cover rounded-md"
											/>
											<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
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
													className="btn btn-xs btn-circle btn-ghost"
												>
													<Eye color="white" size={16} />
												</button>
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														removeThumbnail();
													}}
													className="btn btn-xs btn-circle btn-ghost"
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
										<p className="text-xs text-gray-500">
											Add Images
										</p>
									</div>
									{productImageFiles.map((image, index) => (
										<div
											key={index}
											className="relative size-[100px] group"
										>
											<img
												src={
													image instanceof File
														? URL.createObjectURL(image)
														: image
												}
												alt={`Product ${index + 1}`}
												className="w-full h-full object-cover rounded-md"
											/>
											<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														openModal(
															typeof image === 'string'
																? image
																: URL.createObjectURL(image)
														);
													}}
													className="btn btn-xs btn-circle btn-ghost"
												>
													<Eye color="white" size={16} />
												</button>
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														removeProductImage(index);
													}}
													className="btn btn-xs btn-circle btn-ghost"
												>
													<TrashIcon color="white" size={16} />
												</button>
											</div>
										</div>
									))}
								</div>
							</label>

							<label className="form-control col-span-3">
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

							{fields.map((_, index) => (
								<div
									key={index}
									className="col-span-3 flex items-center justify-between gap-3"
								>
									<div className="flex gap-3 w-full items-center">
										<div className="grid grid-cols-3 gap-3 w-full items-center">
											<div className="form-control relative">
												<select
													className="select select-bordered w-full"
													{...register(
														`variants.${index}.size_id`
													)}
												>
													<option value="">Select Size</option>
													{sizes.map((size) => (
														<option key={size.id} value={size.id}>
															{size.size}
														</option>
													))}
												</select>
												{errors.variants && (
													<p className="text-red-500 text-xs absolute -bottom-5">
														{
															errors.variants?.[index]?.size_id
																?.message
														}
													</p>
												)}
											</div>

											<div className="form-control relative">
												<select
													className="select select-bordered w-full"
													{...register(
														`variants.${index}.color_id`
													)}
												>
													<option value="">Select Color</option>
													{colors.map((color) => (
														<option
															key={color.id}
															value={color.id}
														>
															{color.color}
														</option>
													))}
												</select>
												{errors.variants && (
													<p className="text-red-500 text-xs absolute -bottom-5">
														{
															errors.variants?.[index]?.color_id
																?.message
														}
													</p>
												)}
											</div>

											<div className="form-control relative">
												<input
													type="number"
													placeholder="Quantity"
													className="input input-bordered w-full"
													{...register(
														`variants.${index}.quantity`
													)}
												/>
												{errors.variants && (
													<p className="text-red-500 text-xs absolute -bottom-5">
														{
															errors.variants?.[index]?.quantity
																?.message
														}
													</p>
												)}
											</div>
										</div>
									</div>
									<button
										type="button"
										onClick={() => removeVariant(index)}
										className="btn btn-sm btn-error"
									>
										<TrashIcon className="w-5 h-5 text-white" />
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
										Updating product...
									</>
								) : (
									'Update product'
								)}
							</button>
						</form>
					)}
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

export default UpdateProduct;
