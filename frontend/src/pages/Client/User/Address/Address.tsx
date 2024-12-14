import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
    errors,
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

  const [searchQuery, setSearchQuery] = React.useState<string>("");

  if (isLoading) return <p>Loading...</p>;
  return (
    <div className="col-span-9 rounded-lg border border-gray-200 shadow-lg h-fit font-sans">
      <div className="p-4">
        <div className="flex justify-between items-center w-full my-4 p-2">
          <h2 className="text-lg font-bold text-blue-500">Danh sách địa chỉ</h2>
          <div>
            {address.length < addressLimit && (
              <button
                onClick={() => setShowPopup(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              >
                <Plus className="inline-block mr-1" /> Địa chỉ mới
              </button>
            )}
          </div>
        </div>
        {address
          .sort((a: any, b: any) => {
            if (a.is_default && !b.is_default) {
              return -1; // Địa chỉ có is_default = true sẽ được đặt lên trên cùng
            }
            if (!a.is_default && b.is_default) {
              return 1; // Địa chỉ không có is_default = true sẽ ở dưới cùng
            }
            return 0; // Nếu cả hai đều có giá trị giống nhau, không thay đổi thứ tự
          })
          .map((items: any, index: number) => (
            <div key={index} className="p-4 mb-4 border rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold">
                    {items.shipping_detail.name}
                  </span>{" "}
                  |{" "}
                  <span className="text-gray-600">
                    (+84) {items.shipping_detail.phone_number}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(items)}>
                    <Pencil className="w-5 h-5 text-blue-500" />
                  </button>
                  <button>
                    <Trash2
                      onClick={() => handleDelete(items.id)}
                      className="w-5 h-5 text-red-500"
                    />
                  </button>
                </div>
              </div>
              <div className="text-gray-700">
                {items.shipping_detail.address_detail}
              </div>
              <div className="text-gray-500">
                {items.shipping_detail.address}
              </div>
              {items.is_default && (
                <div className="text-sm mt-2 text-blue-500 font-semibold border p-1 border-blue-500 inline-block">
                  Mặc định
                </div>
              )}
            </div>
          ))}

        {/* Popup form add shipping */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={`bg-white p-8 rounded-lg max-w-md w-full shadow-lg transition-all duration-300 transform ${showPopup
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
            >
              <h2 className="text-lg font-bold mb-4">
                {editAddress ? "Chỉnh sửa địa chỉ" : "Địa chỉ mới"}
              </h2>

              {/* Contact */}
              <label className="block font-semibold">Liên hệ</label>
              <div>
                <input
                  {...register("name")}
                  placeholder="Họ và tên"
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  defaultValue={
                    editAddress ? editAddress.shipping_detail.name : ""
                  }
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.name.message}
                  </p>
                )}
                <input
                  {...register("phone_number")}
                  placeholder="Số điện thoại"
                  type="number"
                  className="w-full border rounded p-2 mb-4"
                  defaultValue={
                    editAddress ? editAddress.shipping_detail.phone_number : ""
                  }
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <input
                type="hidden"
                {...register("address")}
                value={selectedLocation || ""}
              />

              {/* Address */}
              <div>
                <label className="block font-bold">Địa chỉ</label>
                <button
                  type="button"
                  onClick={() => setShowPopup1(true)}
                  className="border border-gray-300 w-full p-2 rounded mb-4 text-left"
                >
                  {selectedLocation
                    ? selectedLocation
                    : "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"}
                </button>
                {showPopup1 && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg">
                      <div className="flex items-center mb-4">
                        <ChevronLeft
                          onClick={() => setShowPopup1(false)}
                          className="w-6 h-6 mr-2 cursor-pointer text-blue-500"
                        />
                        <label className="w-full input input-bordered flex items-center gap-2">
                          <input
                            type="text"
                            className="grow"
                            placeholder="Tìm kiếm tỉnh, quận, phường..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </label>
                      </div>
                      <LocationSelect
                        searchQuery={searchQuery}
                        onLocationSelect={handleLocationSelect}
                        onClose={() => setShowPopup1(false)}
                      />
                    </div>
                  </div>
                )}
                {errors.address && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.address.message}
                  </p>
                )}
                <input
                  {...register("address_detail")}
                  placeholder="Địa chỉ chi tiết"
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  defaultValue={
                    editAddress
                      ? editAddress.shipping_detail.address_detail
                      : ""
                  }
                />
                {errors.address_detail && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.address_detail.message}
                  </p>
                )}
                <label className="font-medium flex items-center">
                  <span>Đặt làm địa chỉ mặc định</span>
                  <input
                    {...register("is_default")}
                    type="checkbox"
                    className="toggle ml-auto"
                    defaultChecked={
                      editAddress ? editAddress.is_default : false
                    }
                  />
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setEditAddress(null);
                  }}
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editAddress ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressComponent;
