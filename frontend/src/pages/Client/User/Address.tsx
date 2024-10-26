import React, { useState } from "react";
import { Check, X } from "lucide-react";
import "daisyui/dist/full.css";

interface Address {
  id: number;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const Address: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    id: Date.now(),
    address: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
    isDefault: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  const addAddress = () => {
    if (
      newAddress.address &&
      newAddress.city &&
      newAddress.postal_code &&
      newAddress.country &&
      newAddress.phone
    ) {
      setAddresses([
        ...addresses,
        { ...newAddress, id: Date.now(), isDefault: addresses.length === 0 },
      ]);
      setNewAddress({
        id: Date.now(),
        address: "",
        city: "",
        postal_code: "",
        country: "",
        phone: "",
        isDefault: false,
      });
      setIsModalOpen(false); // Đóng modal sau khi thêm địa chỉ
    } else {
      alert("Please enter all the fields.");
    }
  };

  const setDefaultAddress = (id: number) => {
    const updatedAddresses = addresses.map((addr) =>
      addr.id === id
        ? { ...addr, isDefault: true }
        : { ...addr, isDefault: false }
    );
    setAddresses(updatedAddresses);
  };

  return (
    <div className="p-6 col-span-9 w-full mx-auto shadow-2xl rounded-lg bg-white">
      {/* Nút mở modal thêm địa chỉ */}
      <label
        htmlFor="address-modal"
        className="btn btn-outline bg-[#4182F9] text-white mb-6 shadow-md hover:bg-[#356ac9]"
      >
        Add New Address
      </label>
      <input
        type="checkbox"
        id="address-modal"
        className="modal-toggle"
        checked={isModalOpen}
        onChange={() => setIsModalOpen(!isModalOpen)}
      />
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box relative shadow-xl rounded-lg">
          <label
            htmlFor="address-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={() => setIsModalOpen(false)}
          >
            <X />
          </label>
          <h3 className="text-lg font-bold mb-4">Add Address</h3>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                name="address"
                value={newAddress.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">City</span>
              </label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleInputChange}
                placeholder="City"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Zip Code</span>
              </label>
              <input
                type="text"
                name="postal_code"
                value={newAddress.postal_code}
                onChange={handleInputChange}
                placeholder="Zip Code"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Country</span>
              </label>
              <input
                type="text"
                name="country"
                value={newAddress.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="number"
                name="phone"
                value={newAddress.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-outline text-white bg-red-500 hover:bg-red-600 shadow-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline bg-[#4182F9] text-white shadow-md hover:bg-[#356ac9]"
                onClick={addAddress}
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách địa chỉ */}
      <h2 className="text-2xl font-semibold mb-4">List Address</h2>
      {addresses.length === 0 ? (
        <p className="text-gray-500">
          There are no addresses yet. Please add an address by clicking "Add
          Address".
        </p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>City</th>
                <th>Zip Code</th>
                <th>Country</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr, index) => (
                <tr
                  key={addr.id}
                  className={addr.isDefault ? "bg-green-100" : ""}
                >
                  <th>{index + 1}</th>
                  <td>{addr.address}</td>
                  <td>{addr.city}</td>
                  <td>{addr.postal_code}</td>
                  <td>{addr.country}</td>
                  <td>{addr.phone}</td>
                  <td>
                    {!addr.isDefault ? (
                      <button
                        className="btn btn-outline btn-primary btn-sm shadow-sm hover:bg-blue-600"
                        onClick={() => setDefaultAddress(addr.id)}
                      >
                        Select as Default
                      </button>
                    ) : (
                      <span className="badge badge-success flex items-center text-white">
                        <Check className="mr-1" /> Default
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Address;
