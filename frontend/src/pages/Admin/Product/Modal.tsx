import { TrashIcon, Upload } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

const ModalProduct = () => {
	const { control } = useForm();

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'variants',
	});

	return (
		<dialog id="modal-product" className="modal">
			<div className="modal-box w-11/12 max-w-5xl">
				<h3 className="font-bold text-lg">Product Detail</h3>
				<div className="modal-action w-full">
					<form
						method="dialog"
						className="grid grid-cols-3 gap-x-4 gap-y-5 w-full"
					>
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
							<select className="select select-bordered w-full max-w-xs">
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
								<option disabled defaultValue="Select Status">
									Select Status
								</option>
								<option>Active</option>
								<option>Inactive</option>
							</select>
						</label>

						<div className="form-control col-span-3">
							<div className="label">
								<span className="label-text">Image</span>
							</div>
							<input
								type="file"
								className="hidden file-input file-input-bordered file-input-sm w-full max-w-xs"
							/>
							<div className="flex gap-2">
								<div
									onClick={() => {
										const input = document.querySelector(
											'input[type="file"]'
										) as HTMLInputElement;
										input.click();
									}}
									className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md"
								>
									<Upload />
									<p className="text-sm text-gray-500">Upload Image</p>
								</div>
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
							<>
								<div className="col-span-3 flex items-end gap-2">
									<div className="grid grid-cols-3 gap-2 w-full">
										<label className="form-control col-span-1">
											<div className="label">
												<span className="label-text">Size</span>
											</div>
											<select className="select select-sm select-bordered w-full max-w-xs">
												<option disabled defaultValue="Select Size">
													Select Size
												</option>
												<option>38</option>
												<option>39</option>
												<option>40</option>
												<option>41</option>
											</select>
										</label>

										<label className="form-control col-span-1">
											<div className="label">
												<span className="label-text">Color</span>
											</div>
											<select className="select select-sm select-bordered w-full max-w-xs">
												<option
													disabled
													defaultValue="Select Color"
												>
													Select Color
												</option>
												<option>Red</option>
												<option>Blue</option>
												<option>Green</option>
												<option>Yellow</option>
											</select>
										</label>

										<label className="form-control col-span-1">
											<div className="label">
												<span className="label-text">Quantity</span>
											</div>
											<input
												type="number"
												placeholder="Type here"
												className="input input-sm input-bordered w-full"
											/>
										</label>
									</div>
									<button
										type="button"
										onClick={() => remove(index)}
										className="btn btn-sm btn-error"
									>
										<TrashIcon className="w-5 h-5 text-white" />
									</button>
								</div>
							</>
						))}

						<button
							type="button"
							onClick={() =>
								append({ size: '', color: '', quantity: 0 })
							}
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
			<form method="dialog" className="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
};

export default ModalProduct;
