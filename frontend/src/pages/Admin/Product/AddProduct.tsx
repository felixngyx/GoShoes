import { TrashIcon, Upload, Eye, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
	thumbnail: Joi.string().required().messages({
		'string.empty': 'Thumbnail is required',
	}),
	images: Joi.array().items(Joi.string()).required().messages({
		'array.base': 'Images must be an array',
		'array.min': 'At least one image is required',
	}),
	stock_quantity: Joi.number().min(0).required().messages({
		'number.min': 'Stock quantity must be at least 0',
	}),
	variants: Joi.array()
		.items(
			Joi.object({
				color: Joi.string().required(),
				size_id: Joi.number().required(),
				quantity: Joi.number().min(0).required(),
				image_variant: Joi.string().allow(''),
			})
		)
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one variant is required',
		}),
});

// Update the type definition
type ProductFormData = {
	name: string;
	description: string;
	price: number;
	stock_quantity: number;
	promotional_price: number;
	status: string;
	sku: string;
	hashtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	images: string[];
	variants: {
		color: string;
		size_id: number;
		quantity: number;
		image_variant: string;
	}[];
};

const AddProduct = () => {
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [sizes, setSizes] = useState<SIZE[]>([]);
	const [brands, setBrands] = useState<BRAND[]>([]);

	useEffect(() => {
		try {
			(async () => {
				const resCategory = await categoryService.getAll();
				setCategories(resCategory.data.category.data);
				const resSize = await sizeService.getAll();
				setSizes(resSize.data.sizes.data);
				const resBrand = await brandService.getAll();
				setBrands(resBrand.data.brands.data);
			})();
		} catch (error) {}
	}, []);

	const {
		register,
		handleSubmit,
		control,
		clearErrors,
		setValue, // Add this
		formState: { errors },
	} = useForm<ProductFormData>({
		resolver: joiResolver(productSchema),
		defaultValues: {
			variants: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'variants',
	});

	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); // Add this line
	const modalRef = useRef<HTMLDialogElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [productImages, setProductImages] = useState<string[]>([]);
	const productImagesInputRef = useRef<HTMLInputElement>(null);

	// Add this new state for variant images
	const [variantImages, setVariantImages] = useState<(string | null)[]>([]);

	// Add new state for variant image files
	const [variantImageFiles, setVariantImageFiles] = useState<(File | null)[]>(
		[]
	);

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	// Add state to store the actual files
	const [productImageFiles, setProductImageFiles] = useState<File[]>([]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setThumbnail(objectUrl);
			setThumbnailFile(file);
			// Set the value for the thumbnail field
			setValue('thumbnail', objectUrl);
			clearErrors('thumbnail');
		}
	};

	const removeThumbnail = () => {
		setThumbnail(null);
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
			const newImages = filesArray.map((file) => URL.createObjectURL(file));
			setProductImages((prevImages) => [...prevImages, ...newImages]);
			// Add this line to update the form field
			setValue('images', [...productImages, ...newImages]);
			clearErrors('images');
		}
	};

	const removeProductImage = (index: number) => {
		setProductImages((prev) => prev.filter((_, i) => i !== index));
		setProductImageFiles((prev) => prev.filter((_, i) => i !== index));
		// Add this line to update the form field
		setValue(
			'images',
			productImages.filter((_, i) => i !== index)
		);
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
		event.preventDefault(); // Add this line
		const file = event.target.files?.[0];
		if (file) {
			const newImages = [...variantImages];
			const newFiles = [...variantImageFiles];
			newImages[index] = URL.createObjectURL(file);
			newFiles[index] = file;
			setVariantImages(newImages);
			setVariantImageFiles(newFiles);
		}
	};

	const removeVariantImage = (index: number) => {
		const newImages = [...variantImages];
		newImages[index] = null;
		setVariantImages(newImages);
	};

	// Modify the append function to also add a null image
	const addVariant = () => {
		append({ color: '', size_id: 0, quantity: 0, image_variant: '' });
		setVariantImages([...variantImages, null]);
	};

	// Modify the remove function to also remove the corresponding image
	const removeVariant = (index: number) => {
		remove(index);
		const newImages = [...variantImages];
		newImages.splice(index, 1);
		setVariantImages(newImages);
	};

	const onSubmit = async (data: ProductFormData) => {
		try {
			// Upload thumbnail if exists
			const thumbnailUrl = thumbnailFile
				? await uploadImageToCloudinary(thumbnailFile)
				: '';

			// Upload product images
			const uploadedProductImages = await Promise.all(
				productImageFiles.map((file) => uploadImageToCloudinary(file))
			);

			// Upload variant images
			const uploadedVariantImages = await Promise.all(
				variantImageFiles.map((file) =>
					file ? uploadImageToCloudinary(file) : null
				)
			);

			// Prepare variants data
			const formattedVariants = data.variants.map(
				(variant: any, index: number) => ({
					color: variant.color,
					link_image: uploadedVariantImages[index],
					size_id: variant.size_id,
					quantity: variant.quantity,
					image_variant: uploadedVariantImages[index],
				})
			);

			// Prepare final form data
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
				images: uploadedProductImages,
				stock_quantity: data.stock_quantity,
			};

			// Send to backend
			await productService.create(formData);
			toast.success('Product created successfully');
			// navigate('/admin/products');
		} catch (error) {
			toast.error('Failed to create product');
			console.error(error);
		}
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
								<span className="label-text">Category</span>
							</div>
							<select
								{...register('category_ids.0')} // Change to register first array element
								className="select select-bordered w-full"
							>
								<option value="">Select Category</option>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
							{errors.category_ids && (
								<p className="text-red-500 text-xs">
									{errors.category_ids.message}
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
								type="text"
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
								<span className="label-text">Status</span>
							</div>
							<select
								{...register('status')}
								className="select select-bordered w-full"
							>
								<option defaultValue="Select Status">
									Select Status
								</option>
								<option value={Status.PUBLISH}>Publish</option>
								<option value={Status.UNPUBLISH}>Unpublish</option>
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
								{thumbnail ? (
									<div className="relative size-[100px] group">
										<img
											src={thumbnail}
											alt="Thumbnail"
											className="w-full h-full object-cover rounded-md"
										/>
										<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													openModal(thumbnail);
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
										<p className="text-sm text-gray-500">
											Upload Image
										</p>
									</div>
								)}
							</div>
						</label>

						{/* New section for product images */}
						<label className="form-control col-span-1">
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
									<p className="text-sm text-gray-500">Add Images</p>
								</div>
								{productImages.map((image, index) => (
									<div
										key={index}
										className="relative size-[100px] group"
									>
										<img
											src={image}
											alt={`Product ${index + 1}`}
											className="w-full h-full object-cover rounded-md"
										/>
										<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													openModal(image);
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
											onChange={(e) =>
												handleVariantImageChange(index, e)
											}
											accept="image/*"
											id={`variant-image-${index}`}
										/>
										<div className="flex gap-2">
											{variantImages[index] ? (
												<div className="relative size-[100px] group">
													<img
														src={variantImages[index]!}
														alt={`Variant ${index + 1}`}
														className="w-full h-full object-cover rounded-md"
													/>
													<div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
														<button
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																openModal(
																	variantImages[index]!
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
									</div>
									<div className="grid grid-cols-3 gap-3 w-full items-center">
										<select className="select select-bordered w-full">
											<option defaultValue="Select Size">
												Select Size
											</option>
											{sizes.map((size) => (
												<option key={size.id} value={size.id}>
													{size.size}
												</option>
											))}
										</select>

										<input
											type="text"
											placeholder="Color"
											className="input input-bordered w-full"
										/>

										<input
											type="number"
											placeholder="Quantity"
											className="input input-bordered w-full"
										/>
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
							type="submit"
							className="btn mt-4 col-span-3 bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
						>
							Add product
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
