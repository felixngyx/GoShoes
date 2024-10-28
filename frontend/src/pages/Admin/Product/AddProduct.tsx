import { TrashIcon, Upload, Eye, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Status } from '.';

// type DataUpload = {
// 	name: string;
// 	price: number;
// 	category: string[];
// 	promotionPrice: number;
// 	sku: string;
// 	hashtag: string;
// 	status: string;
// 	thumbnail: string;
// 	variant: {
// 		image: string;
// 		size: string;
// 		color: string;
// 		quantity: number;
// 	}[];
// 	description: string;
// };

const AddProduct = () => {
	const { control } = useForm();

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'variants',
	});

	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const modalRef = useRef<HTMLDialogElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [productImages, setProductImages] = useState<string[]>([]);
	const productImagesInputRef = useRef<HTMLInputElement>(null);

	// Add this new state for variant images
	const [variantImages, setVariantImages] = useState<(string | null)[]>([]);

	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) setThumbnail(URL.createObjectURL(file));
	};

	const removeThumbnail = () => setThumbnail(null);

	const openModal = (imageSrc: string) => {
		setPreviewImage(imageSrc);
		modalRef.current?.showModal();
	};

	const closeModal = () => modalRef.current?.close();

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleProductImagesChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (files) {
			const newImages = Array.from(files).map((file) =>
				URL.createObjectURL(file)
			);
			setProductImages((prevImages) => [...prevImages, ...newImages]);
		}
	};

	const removeProductImage = (index: number) => {
		setProductImages((prevImages) =>
			prevImages.filter((_, i) => i !== index)
		);
	};

	const handleProductImagesUploadClick = () => {
		productImagesInputRef.current?.click();
	};

	const handleVariantImageChange = (
		index: number,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const newImages = [...variantImages];
			newImages[index] = URL.createObjectURL(file);
			setVariantImages(newImages);
		}
	};

	const removeVariantImage = (index: number) => {
		const newImages = [...variantImages];
		newImages[index] = null;
		setVariantImages(newImages);
	};

	// Modify the append function to also add a null image
	const addVariant = () => {
		append({ size: '', color: '', quantity: 0 });
		setVariantImages([...variantImages, null]);
	};

	// Modify the remove function to also remove the corresponding image
	const removeVariant = (index: number) => {
		remove(index);
		const newImages = [...variantImages];
		newImages.splice(index, 1);
		setVariantImages(newImages);
	};

	return (
		<>
			<div className="w-full border border-stroke p-4 shadow-lg">
				<h3 className="font-bold text-2xl">Add Product</h3>
				<div className="w-full">
					<form className="grid grid-cols-3 gap-x-4 gap-y-5 w-full">
						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Product Name</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Price</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Category</span>
							</div>
							<select className="select select-bordered w-full">
								<option disabled defaultValue="Select Category">
									Select Category
								</option>
								<option>Sport</option>
								<option>Fashion</option>
							</select>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Promotion Price</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">SKU</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Hashtag</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								className="input input-bordered w-full"
							/>
						</label>

						<label className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Status</span>
							</div>
							<select className="select select-bordered w-full max-w-xs">
								<option defaultValue="Select Status">
									Select Status
								</option>
								<option value={Status.PUBLISH}>Publish</option>
								<option value={Status.UNPUBLISH}>Unpublish</option>
								<option value={Status.HIDDEN}>Hidden</option>
							</select>
						</label>

						<div className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Thumbnail</span>
							</div>
							<input
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
										onClick={handleUploadClick}
										className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
									>
										<Upload />
										<p className="text-sm text-gray-500">
											Upload Image
										</p>
									</div>
								)}
							</div>
						</div>

						{/* New section for product images */}
						<div className="form-control col-span-1">
							<div className="label">
								<span className="label-text">Product Images</span>
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
									onClick={handleProductImagesUploadClick}
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
						</div>

						<label className="form-control col-span-3">
							<div className="label">
								<span className="label-text">Description</span>
							</div>
							<textarea
								className="textarea textarea-bordered"
								placeholder="Type here"
							></textarea>
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
											<option>38</option>
											<option>39</option>
											<option>40</option>
											<option>41</option>
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

						<div className="flex items-center gap-2 col-span-3 w-full justify-end">
							<button className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error w-fit">
								Cancel
							</button>
							<button className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary w-fit">
								Save
							</button>
						</div>
					</form>
				</div>
			</div>

			<dialog ref={modalRef} className="modal">
				<div className="modal-box">
					<button
						onClick={closeModal}
						className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					>
						<X size={16} />
					</button>
					<h3 className="font-bold text-lg mb-4">Image Preview</h3>
					{previewImage && (
						<img
							src={previewImage}
							alt="Preview"
							className="w-full h-auto"
						/>
					)}
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
};

export default AddProduct;
