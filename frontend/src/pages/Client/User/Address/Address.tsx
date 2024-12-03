import {
  ChevronLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import React from "react";
import { useShipping } from "../../../../hooks/client/useShipping";
import LocationSelect from "./LocationSelector";

const AddressComponent: React.FC = () => {
  const {
    address,
    isLoading,
    selectedLocation,
    showPopup,
    showPopup1,
    addressLimit,
    setEditAddress,
    register,
    handleSubmit,
    onSubmit,
    handleDelete,
    handleLocationSelect,
    setShowPopup,
    setShowPopup1,
    handleEdit,
    editAddress,
  } = useShipping();

  if (isLoading) return <p>Loading...</p>;
  return (
    <div className="col-span-9 rounded-lg border border-gray-200 shadow-lg h-fit font-sans p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-blue-500">List Address</h2>
        <div>
          {address.length < addressLimit && (
            <button
              onClick={() => setShowPopup(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            >
              <Plus className="inline-block mr-1" /> New Address
            </button>
          )}
        </div>
      </div>

      {/* List Addresses */}
      {address
        .sort((a: any, b: any) => (a.is_default ? -1 : 1))
        .map((items: any, index: number) => (
          <div
            key={index}
            className="p-4 mb-4 border rounded-md shadow-sm bg-white"
          >
            <div className="flex flex-col sm:flex-row justify-between mb-2">
              <div>
                <span className="font-semibold">
                  {items.shipping_detail.name}
                </span>{" "}
                |{" "}
                <span className="text-gray-600">
                  (+84) {items.shipping_detail.phone_number}
                </span>
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button onClick={() => handleEdit(items)}>
                  <Pencil className="w-5 h-5 text-blue-500" />
                </button>
                <button onClick={() => handleDelete(items.id)}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
            <div className="text-gray-700">
              {items.shipping_detail.address_detail}
            </div>
            <div className="text-gray-500">{items.shipping_detail.address}</div>
            {items.is_default && (
              <div className="text-sm mt-2 text-blue-500 font-semibold border p-1 border-blue-500 inline-block">
                Default
              </div>
            )}
          </div>
        ))}

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full shadow-lg"
          >
            <h2 className="text-lg font-bold mb-4">
              {editAddress ? "Edit Address" : "New Address"}
            </h2>

            {/* Contact */}
            <label className="block font-semibold">Contact</label>
            <div>
              <input
                {...register("name")}
                placeholder="Full name"
                type="text"
                className="w-full border rounded p-2 mb-4"
                defaultValue={
                  editAddress ? editAddress.shipping_detail.name : ""
                }
              />
              <input
                {...register("phone_number")}
                placeholder="Phone"
                type="number"
                className="w-full border rounded p-2 mb-4"
                defaultValue={
                  editAddress ? editAddress.shipping_detail.phone_number : ""
                }
              />
            </div>

            <input
              type="hidden"
              {...register("address")}
              value={selectedLocation || ""}
            />

            {/* Address */}
            <label className="block font-semibold">Address</label>
            <button
              type="button"
              onClick={() => setShowPopup1(true)}
              className="border border-gray-300 w-full p-2 rounded mb-4 text-left"
            >
              {selectedLocation
                ? selectedLocation
                : "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"}
            </button>

            <input
              {...register("address_detail")}
              placeholder="Detailed address"
              type="text"
              className="w-full border rounded p-2 mb-4"
              defaultValue={
                editAddress ? editAddress.shipping_detail.address_detail : ""
              }
            />
            <label className="font-medium flex items-center">
              <span>Set as default address</span>
              <input
                {...register("is_default")}
                type="checkbox"
                className="ml-auto"
                defaultChecked={editAddress ? editAddress.is_default : false}
              />
            </label>

            {/* Buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {editAddress ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressComponent;
