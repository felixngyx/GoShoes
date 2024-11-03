import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import React, { useState } from "react";
import {
  fetchDistricts,
  fetchProvinces,
  fetchWards,
} from "../../../../services/client/locationService";
import { District, Province, Ward } from "../../../../types/client/address";

const LocationSelect: React.FC<{
  onLocationSelect: (location: string) => void;
  onClose: () => void;
}> = ({ onLocationSelect, onClose }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [showDistricts, setShowDistricts] = useState(false);
  const [showWards, setShowWards] = useState(false);

  const { data: provinces = [], error: provinceError } = useQuery({
    queryKey: ["provinces"],
    queryFn: fetchProvinces,
  });

  const { data: districts = [], error: districtError } = useQuery({
    queryKey: ["districts", selectedProvince?.code],
    queryFn: () =>
      selectedProvince
        ? fetchDistricts(selectedProvince.code)
        : Promise.resolve([]),
    enabled: !!selectedProvince,
  });

  const { data: wards = [], error: wardError } = useQuery({
    queryKey: ["wards", selectedDistrict?.code],
    queryFn: () =>
      selectedDistrict
        ? fetchWards(selectedDistrict.code)
        : Promise.resolve([]),
    enabled: !!selectedDistrict,
  });

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowDistricts(true); // Show districts
  };

  const handleDistrictSelect = (district: District) => {
    if (district && district.code) {
      setSelectedDistrict(district);
      setSelectedWard(null);
      setShowWards(true); // Show wards
    } else {
      console.error("Invalid district selected");
    }
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    if (selectedProvince && selectedDistrict && ward) {
      const locationString = `${selectedProvince.name} | ${selectedDistrict.name} | ${ward.name}`;
      onLocationSelect(locationString);
      onClose(); // Close the popup
    }
  };

  const handleReset = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowDistricts(false); // Reset visibility
    setShowWards(false); // Reset visibility
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
        onClick={() => console.log("Use current location")}
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
        <>
          <h3 className="text-xs font-thin mb-2">Tỉnh/Thành phố:</h3>
          <div className="overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm">
            <table className="w-full">
              <tbody>
                {provinces?.map((province: any, index: number) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-blue-100 transition duration-200"
                    onClick={() => handleProvinceSelect(province)}
                  >
                    <td className="border-b border-gray-200 p-2">
                      {province.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedProvince && !selectedDistrict && showDistricts && (
        <>
          <h3 className="text-xs font-thin mb-2">Quận/Huyện:</h3>
          <div
            className={`overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm transition-opacity duration-500 ${
              showDistricts ? "opacity-100" : "opacity-0"
            }`}
          >
            <table className="w-full">
              <tbody>
                {districts?.map((district: any, index: number) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-blue-100 transition duration-200"
                    onClick={() => handleDistrictSelect(district)}
                  >
                    <td className="border-b border-gray-200 p-2">
                      {district.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedDistrict && showWards && (
        <>
          <h3 className="text-xs font-thin mb-2">Phường/Xã:</h3>
          <div
            className={`overflow-y-auto max-h-100 border border-gray-300 rounded-md mb-4 bg-white shadow-sm transition-opacity duration-500 ${
              showWards ? "opacity-100" : "opacity-0"
            }`}
          >
            <table className="w-full">
              <tbody>
                {wards?.map((ward: any, index: number) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-blue-100 transition duration-200"
                    onClick={() => handleWardSelect(ward)}
                  >
                    <td className="border-b border-gray-200 p-2">
                      {ward.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationSelect;
