import { ChevronLeft, Pencil, Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Address } from "../../../../types/client/address";
import LocationSelect from "./LocationSelector";

const AddressComponent: React.FC = () => {
  const addressLimit = 5;

  const [addresses, setAddresses] = useState<Address[]>([
    {
      name: "Nguyễn Văn A",
      phone: "091233131",
      province: { code: 1, name: "Thành phố Hồ Chí Minh" },
      district: { code: 1, name: "Quận 1" },
      ward: { code: 1, name: "Phường Bến Nghé" },
      detail: "Số nhà 123, đường ABC",
      isDefault: true,
    },
    {
      name: "Nguyễn Văn B",
      phone: "091233131",
      province: { code: 1, name: "Thành phố Hồ Chí Minh" },
      district: { code: 1, name: "Quận 1" },
      ward: { code: 1, name: "Phường Bến Nghé" },
      detail: "Số nhà 123, đường ABC",
      isDefault: false,
    },
    {
      name: "Nguyễn Văn C",
      phone: "091233131",
      province: { code: 1, name: "Thành phố Hồ Chí Minh" },
      district: { code: 1, name: "Quận 1" },
      ward: { code: 1, name: "Phường Bến Nghé" },
      detail: "Số nhà 123, đường ABC",
      isDefault: false,
    },
  ]);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (showPopup || showPopup1) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showPopup, showPopup1]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowPopup1(false);
  };

  const [newAddress, setNewAddress] = useState<Address>({
    name: "",
    phone: "",
    province: null,
    district: null,
    ward: null,
    detail: "",
    isDefault: false,
  });

  return (
    <div className="col-span-9 rounded-lg border border-gray-200 shadow-lg h-fit font-sans">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-blue-500">List Address</h2>
        {addresses.map((address, index) => (
          <div key={index} className="p-4 mb-4 border rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold">{address.name}</span> |{" "}
                <span className="text-gray-600">(+84) {address.phone}</span>
              </div>
              <div className="flex space-x-2">
                <button>
                  <Pencil className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            </div>
            <div className="text-gray-700">{address.detail}</div>
            <div className="text-gray-500">
              {address.ward?.name}, {address.district?.name},{" "}
              {address.province?.name}
            </div>
            {address.isDefault && (
              <div className="text-sm text-blue-500 font-semibold">Default</div>
            )}
          </div>
        ))}

        {/* Nút thêm địa chỉ mới */}
        {addresses.length < addressLimit && (
          <button
            onClick={() => setShowPopup(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 flex items-center"
          >
            <Plus className="inline-block mr-1" /> New Address
          </button>
        )}

        {/* Popup form thêm địa chỉ mới */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`bg-white p-8 rounded-lg max-w-md w-full shadow-lg transition-all duration-300 transform ${
                showPopup
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ display: showPopup ? "block" : "none" }} // Chỉ hiển thị khi showPopup là true
            >
              <h2 className="text-lg font-bold mb-4">New Address</h2>
              <label className="block font-semibold">Contact</label>

              <div>
                <input
                  placeholder="Full name"
                  type="text"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border rounded p-2 mb-4"
                />

                <input
                  placeholder="Phone"
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 mb-4"
                />
              </div>

              <div>
                <label className="block font-bold">Address</label>
                <button
                  onClick={() => setShowPopup1(true)}
                  className="border border-gray-300 w-full p-2 rounded mb-4 text-left"
                >
                  {selectedLocation
                    ? selectedLocation
                    : "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"}
                </button>

                {showPopup1 && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg">
                      <div className="flex items-center mb-4">
                        <ChevronLeft
                          onClick={() => setShowPopup1(false)}
                          className="w-6 h-6  mr-2 cursor-pointer text-blue-500"
                        />
                        <label className="w-full input input-bordered flex items-center gap-2">
                          <input
                            type="text"
                            className="grow"
                            placeholder="Search"
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
                        onLocationSelect={handleLocationSelect}
                        onClose={() => setShowPopup1(false)}
                      />
                    </div>
                  </div>
                )}

                <input
                  placeholder="Detailed address"
                  type="text"
                  value={newAddress.detail}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      detail: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 mb-4"
                />
                <label className="font-medium flex items-center">
                  <span>Set as default address</span>
                  <input
                    type="checkbox"
                    className="toggle ml-auto"
                    onChange={(e) =>
                      setNewAddress((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                    defaultChecked
                  />
                </label>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  // onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressComponent;
