import { MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";

import { District, Province, Ward } from "../../../../types/client/address";
import useLocationSelect from "../../../../hooks/client/useLocationSelect";

const LocationSelect: React.FC<{
  onLocationSelect: (location: string) => void;
  onClose: () => void;
  searchQuery: any;
}> = ({ onLocationSelect, onClose, searchQuery }) => {
  const {
    provinces,
    districts,
    wards,
    provinceError,
    districtError,
    wardError,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    showDistricts,
    showWards,
    handleProvinceSelect,
    handleDistrictSelect,
    handleWardSelect,
    handleReset,
    groupByFirstLetter,
  } = useLocationSelect();

  const filterLocations = (locations: any[], query: string) => {
    return locations.filter((location) =>
      location.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredProvinces = filterLocations(provinces, searchQuery);
  const filteredDistricts = filterLocations(districts, searchQuery);
  const filteredWards = filterLocations(wards, searchQuery);

  useEffect(() => {}, [searchQuery]);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState<string>("");

  // Function to fetch current location and address
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setCurrentLocation({ latitude, longitude });

          console.log("Current Location:", latitude, longitude);

          // Fetch address from OpenStreetMap API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
            );
            const data = await response.json();
            console.log(data); // Log the entire data object to check what is returned

            if (data && data.address) {
              const fullAddress = `${data.address.road || ""}, ${
                data.address.suburb || ""
              }, ${data.address.city || ""}, ${data.address.county || ""}, ${
                data.address.state || ""
              }, ${data.address.country}`;
              setAddress(fullAddress);

              // Call onLocationSelect with the current address to fill in the form
              onLocationSelect(fullAddress); // Pass the address to the parent component
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            alert("Unable to retrieve address for current location.");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const renderLocationDisplay = () => {
    if (selectedWard) {
      return (
        <ul className="steps steps-vertical">
          <li className="step step-primary">{selectedProvince?.name}</li>
          <li className="step step-primary">{selectedDistrict?.name}</li>
          <li className="step">{selectedWard.name}</li>
        </ul>
      );
    }
    if (selectedDistrict) {
      return (
        <ul className="steps steps-vertical">
          <li className="step text-black-2">{selectedProvince?.name}</li>
          <li className="step text-black-2">{selectedDistrict?.name}</li>
          <li className="step step-info">Chọn Phường/Xã</li>
        </ul>
      );
    }
    if (selectedProvince) {
      return (
        <ul className="steps steps-vertical">
          <li className="step text-black-2">{selectedProvince?.name}</li>
          <li className="step step-info w-full">Chọn Quận/Huyện</li>
        </ul>
      );
    }
    return (
      <button
        className="text-black text-[14px] mb-4 flex justify-center items-center border rounded-md shadow-md p-2 space-x-2 w-full"
        onClick={getCurrentLocation}
      >
        <MapPin className="text-blue-500" />
        <p>Use at current location</p>
      </button>
    );
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md font-sans relative">
      {(provinceError || districtError || wardError) && (
        <div className="text-red-500">
          {provinceError?.message ||
            districtError?.message ||
            wardError?.message}
        </div>
      )}

      <h2 className="text-[15px] font-bold mb-4 text-blue-600">
        {renderLocationDisplay()}
      </h2>

      {selectedProvince && (
        <button
          className="absolute top-4 right-4 text-blue-500 hover:underline transition duration-200"
          onClick={handleReset}
        >
          Reset
        </button>
      )}

      {!selectedProvince && (
        <div className="overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm">
          {filteredProvinces.length > 0 ? (
            Object.keys(groupByFirstLetter(filteredProvinces))
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <h3 className="text-xs font-semibold bg-gray-100 p-2">
                    {letter}
                  </h3>
                  <table className="w-full">
                    <tbody>
                      {groupByFirstLetter(filteredProvinces)[letter].map(
                        (province: Province) => (
                          <tr
                            key={province.code}
                            className="cursor-pointer hover:bg-blue-100 transition duration-200"
                            onClick={() => handleProvinceSelect(province)}
                          >
                            <td className="border-b border-gray-200 p-2">
                              {province.name}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500">No results found</div>
          )}
        </div>
      )}

      {selectedProvince && !selectedDistrict && showDistricts && (
        <div className="overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm">
          {filteredDistricts.length > 0 ? (
            Object.keys(groupByFirstLetter(filteredDistricts))
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <h3 className="text-xs font-semibold bg-gray-100 p-2">
                    {letter}
                  </h3>
                  <table className="w-full">
                    <tbody>
                      {groupByFirstLetter(filteredDistricts)[letter].map(
                        (district: District) => (
                          <tr
                            key={district.code}
                            className="cursor-pointer hover:bg-blue-100 transition duration-200"
                            onClick={() => handleDistrictSelect(district)}
                          >
                            <td className="border-b border-gray-200 p-2">
                              {district.name}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500">No results found</div>
          )}
        </div>
      )}

      {selectedDistrict && showWards && (
        <div className="overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm">
          {filteredWards.length > 0 ? (
            Object.keys(groupByFirstLetter(filteredWards))
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <h3 className="text-xs font-semibold bg-gray-100 p-2">
                    {letter}
                  </h3>
                  <table className="w-full">
                    <tbody>
                      {groupByFirstLetter(filteredWards)[letter].map(
                        (ward: Ward) => (
                          <tr
                            key={ward.code}
                            className="cursor-pointer hover:bg-blue-100 transition duration-200"
                            onClick={() =>
                              handleWardSelect(ward, onLocationSelect, onClose)
                            }
                          >
                            <td className="border-b border-gray-200 p-2">
                              {ward.name}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelect;
