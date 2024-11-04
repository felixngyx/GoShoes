import { TrashIcon, Upload, Eye, X, Logs } from 'lucide-react';
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
import { formatVNCurrency } from '../../../common/formatVNCurrency';

// Add form validation schema
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
	promotional_price: Joi.number().positive().required().messages({
		'number.base': 'Promotional price must be a number',
		'number.positive': 'Promotional price must be positive',
	}),
	status: Joi.string().required().messages({
		'string.empty': 'Status is required',
	}),
	sku: Joi.string().required().messages({
		'string.empty': 'SKU is required',
	}),
	hashtag: Joi.string().required().messages({
		'string.empty': 'Hashtag is required',
	}),
	category_ids: Joi.array().items(Joi.number()).required().messages({
		'array.base': 'Category is required',
		'array.min': 'At least one category is required',
	}),
	brand_id: Joi.number().required().messages({
		'number.base': 'Brand is required',
	}),
	thumbnail: Joi.any().required().messages({
		'any.required': 'Thumbnail is required',
	}),
	images: Joi.array().items(Joi.any()).required().messages({
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
				color: Joi.string().required().messages({
					'string.empty': 'Color is required',
					'any.empty': 'Color is required',
					'string.base': 'Color must be a string',
				}),
				size_id: Joi.number().required().messages({
					'number.base': 'Size is required',
				}),
				quantity: Joi.number().min(0).required().messages({
					'number.min': 'Quantity must be at least 0',
					'number.base': 'Quantity must be a number',
				}),
				image_variant: Joi.any().required().messages({
					'any.required': 'Image variant is required',
					'any.empty': 'Image variant is required',
				}),
			})
		)
		.allow(''),
});

// Change component name and add props interface
interface ModalProductProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	product?: PRODUCT | null;
	categories: CATEGORY[];
	sizes: SIZE[];
	brands: BRAND[];
}

const ModalProduct = ({
	isOpen,
	onClose,
	onSuccess,
	product,
	categories,
	sizes,
	brands,
}: ModalProductProps) => {
	const [selectedCategories, setSelectedCategories] = useState<CATEGORY[]>([]);
	const [loading, setLoading] = useState(false);

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
			variants: [],
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

	const [variantImageFiles, setVariantImageFiles] = useState<(File | null)[]>(
		[]
	);

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const [productImageFiles, setProductImageFiles] = useState<File[]>([]);

	useEffect(() => {
		if (product) {
			setValue('name', product.name);
			setValue('description', product.description);
			setValue('price', Number(product.price));
			setValue('promotional_price', Number(product.promotional_price));
			setValue('status', product.status);
			setValue('sku', product.sku);
			setValue('hashtag', product.hashtag);
			setValue('brand_id', product.brand_id);
			setValue('stock_quantity', product.stock_quantity);
			setValue('thumbnail', product.thumbnail);
			setValue('images', product.images);
			if (product.variants) {
				setVariantImageFiles(new Array(product.variants.length).fill(null));
				product.variants.forEach((variant, index) => {
					setValue(`variants.${index}.size_id`, variant.size_id);
					setValue(
						`variants.${index}.color`,
						(variant.color as any)?.color || variant.color
					);
					setValue(`variants.${index}.quantity`, variant.quantity);
					setValue(
						`variants.${index}.image_variant`,
						variant.image_variant
					);
				});
			}

			if (product.categories) {
				setSelectedCategories(product.categories);
				setValue(
					'category_ids',
					product.categories.map((cat) => Number(cat.id))
				);
			}

			if (product.variants && product.variants.length > 0) {
				setValue('variants', product.variants);
			}
		}
	}, [product, setValue]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			setValue('thumbnail', file);
			clearErrors('thumbnail');
		}
	};

	const removeThumbnail = () => {
		setThumbnailFile(null);
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
			setValue('images', [...productImageFiles, ...filesArray]);
			clearErrors('images');
		}
	};

	const removeProductImage = (index: number) => {
		setProductImageFiles((prev) => {
			const newFiles = prev.filter((_, i) => i !== index);
			setValue('images', newFiles);
			return newFiles;
		});
	};

	const handleProductImagesUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		productImagesInputRef.current?.click();
	};

	const handleVariantImageChange = (
		index: number,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			const newFiles = [...variantImageFiles];
			newFiles[index] = file;
			setVariantImageFiles(newFiles);
		}
	};

	const removeVariantImage = (index: number) => {
		const newFiles = [...variantImageFiles];
		newFiles[index] = null;
		setVariantImageFiles(newFiles);
	};

	const addVariant = () => {
		append({ color: '', size_id: 0, quantity: 0, image_variant: '' });
		setVariantImageFiles([...variantImageFiles, null]);
	};

	const removeVariant = (index: number) => {
		remove(index);
		const newFiles = [...variantImageFiles];
		newFiles.splice(index, 1);
		setVariantImageFiles(newFiles);
	};

	const onSubmit = async (data: PRODUCT) => {
		try {
			setLoading(true);
			toast.loading(
				product ? 'Updating product...' : 'Creating product...',
				{ duration: 3000 }
			);

			let thumbnailUrl = product?.thumbnail || '';
			if (thumbnailFile) {
				thumbnailUrl = await uploadImageToCloudinary(thumbnailFile);
			}

			const uploadedProductImages = await Promise.all(
				productImageFiles.map((file) => uploadImageToCloudinary(file))
			);

			const finalImages = [
				...(product?.images || []).filter((img) => typeof img === 'string'),
				...uploadedProductImages,
			];

			const uploadedVariantImages = await Promise.all(
				variantImageFiles.map((file) =>
					file ? uploadImageToCloudinary(file) : null
				)
			);

			const formattedVariants = data.variants?.map(
				(variant: any, index: number) => ({
					...variant,
					image_variant: variantImageFiles[index]
						? uploadedVariantImages[index]
						: variant.image_variant,
				})
			);

			const formData = {
				name: data.name,
				description: data.description,
				price: data.price,
				promotional_price: data.promotional_price,
				status: data.status,
				sku: data.sku,
				hashtag: data.hashtag,
				category_ids: data.category_ids,
				thumbnail: thumbnailUrl,
				brand_id: data.brand_id,
				variants: formattedVariants,
				images: finalImages,
				stock_quantity: data.stock_quantity,
			};

			let res;
			if (product) {
				res = await productService.update(Number(product.id), formData);
				toast.success('Product updated successfully');
			} else {
				res = await productService.create(formData);
				toast.success('Product created successfully');
			}

			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(
				product ? 'Failed to update product' : 'Failed to create product'
			);
			console.error(error);
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

	return (
		<>
			<dialog
				open={isOpen}
				className="modal modal-bottom sm:modal-middle z-100 w-full"
			>
				<div style={{ maxWidth: '70vw' }} className="modal-box z-1000">
					<button
						onClick={onClose}
						className="btn btn-sm btn-circle absolute right-2 top-2"
					>
						<X />
					</button>

					<h3 className="font-bold text-2xl mb-4">
						{product ? 'Edit Product' : 'Add Product'}
					</h3>

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
									{...register('hashtag')}
									type="text"
									placeholder="Type here"
									className="input input-bordered w-full"
								/>
								{errors.hashtag && (
									<p className="text-red-500 text-xs">
										{errors.hashtag.message}
									</p>
								)}
							</label>

							<label className="form-control col-span-1">
								<div className="label">
									<span className="label-text">Select Status</span>
								</div>
								<select
									{...register('status')}
									className="select select-bordered w-full"
									defaultValue={product?.status || 'Select Status'}
								>
									<option value="">Select Status</option>
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
													<li // @ts-ignore
														className="hover:bg-gray-100 rounded-none"
														key={category.id}
														onClick={(
															e: React.MouseEvent<HTMLLIElement>
														) => {
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
									{...register('thumbnail')}
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
											<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														openModal(
															URL.createObjectURL(thumbnailFile)
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
									) : product?.thumbnail ? (
										<div className="relative size-[100px] group">
											<img
												src={product.thumbnail as string}
												alt="Thumbnail"
												className="w-full h-full object-cover rounded-md"
											/>
											<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														openModal(
															product.thumbnail as string
														);
													}}
													className="btn btn-xs btn-circle btn-ghost"
												>
													<Eye color="white" size={16} />
												</button>
											</div>
										</div>
									) : (
										<div
											onClick={(e) => handleUploadClick(e)}
											className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
										>
											<Upload />
											<p className="text-sm text-gray-500">
												Upload Image
											</p>
										</div>
									)}
								</div>
							</label>

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
										<p className="text-sm text-gray-500">
											Add Images
										</p>
									</div>
									{product?.images
										?.filter((img) => typeof img === 'string')
										.map((image, index) => (
											<div
												key={`existing-${index}`}
												className="relative size-[100px] group"
											>
												<img
													src={image as string}
													alt={`Product ${index + 1}`}
													className="w-full h-full object-cover rounded-md"
												/>
												<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															openModal(image as string);
														}}
														className="btn btn-xs btn-circle btn-ghost"
													>
														<Eye color="white" size={16} />
													</button>
												</div>
											</div>
										))}
									{productImageFiles.map((image, index) => (
										<div
											key={index}
											className="relative size-[100px] group"
										>
											<img
												src={URL.createObjectURL(image)}
												alt={`Product ${index + 1}`}
												className="w-full h-full object-cover rounded-md"
											/>
											<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														openModal(URL.createObjectURL(image));
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
										<div className="form-control">
											<input
												type="file"
												className="hidden"
												accept="image/*"
												id={`variant-image-${index}`}
												onChange={(e) => {
													register(
														`variants.${index}.image_variant`
													).onChange(e);
													handleVariantImageChange(index, e);
												}}
											/>
											<div className="flex gap-2 relative">
												{variantImageFiles[index] ? (
													<>
														<div className="relative size-[100px] group">
															<img
																src={URL.createObjectURL(
																	variantImageFiles[index]
																)}
																alt={`Variant ${index + 1}`}
																className="w-full h-full object-cover rounded-md"
															/>
															<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
																<button
																	onClick={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		openModal(
																			URL.createObjectURL(
																				variantImageFiles[
																					index
																				]!
																			)
																		);
																	}}
																	className="btn btn-xs btn-circle btn-ghost"
																>
																	<Eye
																		color="white"
																		size={16}
																	/>
																</button>
																<button
																	onClick={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		removeVariantImage(index);
																	}}
																	className="btn btn-xs btn-circle btn-ghost"
																>
																	<TrashIcon
																		color="white"
																		size={16}
																	/>
																</button>
															</div>
														</div>
														{errors.variants && (
															<p className="text-red-500 text-xs absolute -bottom-5">
																{
																	errors.variants?.[index]
																		?.image_variant?.message
																}
															</p>
														)}
													</>
												) : product?.variants?.[index]
														?.image_variant ? (
													<div className="relative size-[100px] group">
														<img
															src={
																product.variants?.[index]
																	.image_variant as string
															}
															alt={`Variant ${index + 1}`}
															className="w-full h-full object-cover rounded-md"
														/>
														<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
															<button
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	openModal(
																		product.variants?.[index]
																			.image_variant as string
																	);
																}}
																className="btn btn-xs btn-circle btn-ghost"
															>
																<Eye color="white" size={16} />
															</button>
														</div>
													</div>
												) : (
													<label
														htmlFor={`variant-image-${index}`}
														className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
													>
														<Upload />
														<p className="text-sm text-gray-500">
															Upload Image
														</p>
													</label>
												)}
											</div>
											{errors.variants && (
												<p className="text-red-500 text-xs absolute -bottom-5">
													{
														errors.variants?.[index]
															?.image_variant?.message
													}
												</p>
											)}
										</div>
										<div className="grid grid-cols-3 gap-3 w-full items-center">
											<div className="form-control relative">
												<select
													className="select select-bordered w-full"
													{...register(
														`variants.${index}.size_id`
													)}
												>
													<option defaultValue="Select Size">
														Select Size
													</option>
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
												<input
													type="text"
													placeholder="Color"
													className="input input-bordered w-full"
													{...register(`variants.${index}.color`)}
												/>
												{errors.variants && (
													<p className="text-red-500 text-xs absolute -bottom-5">
														{
															errors.variants?.[index]?.color
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
										{product
											? 'Updating product...'
											: 'Creating product...'}
									</>
								) : product ? (
									'Update product'
								) : (
									'Add product'
								)}
							</button>
						</form>
					</div>
				</div>

				<div className="modal-backdrop bg-black/50" onClick={onClose}>
					<button>close</button>
				</div>
			</dialog>

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

export default ModalProduct;
