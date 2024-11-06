import { useQuery } from "@tanstack/react-query";
import {
  fetchDistricts,
  fetchProvinces,
  fetchWards,
} from "../../services/client/locationService";
import { District, Province, Ward } from "../../types/client/address";
import { useState } from "react";

const useLocationSelect = () => {
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
    select: (data) =>
      data
        .map((province: Province) => ({
          ...province,
          name: province.name.replace(/^(Tỉnh|Thành phố)\s+/i, ""),
        }))
        .sort((a: Province, b: Province) => a.name.localeCompare(b.name)),
  });

  const { data: districts = [], error: districtError } = useQuery({
    queryKey: ["districts", selectedProvince?.code],
    queryFn: () =>
      selectedProvince
        ? fetchDistricts(selectedProvince.code)
        : Promise.resolve([]),
    enabled: !!selectedProvince,
    select: (data) =>
      data.sort((a: District, b: District) => a.name.localeCompare(b.name)),
  });

  const { data: wards = [], error: wardError } = useQuery({
    queryKey: ["wards", selectedDistrict?.code],
    queryFn: () =>
      selectedDistrict
        ? fetchWards(selectedDistrict.code)
        : Promise.resolve([]),
    enabled: !!selectedDistrict,
    select: (data) =>
      data.sort((a: Ward, b: Ward) => a.name.localeCompare(b.name)),
  });

  const groupByFirstLetter = (data: Province[] | District[] | Ward[]) => {
    return data.reduce((acc: Record<string, any[]>, item: any) => {
      const firstLetter = item.name[0].toUpperCase();
      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(item);
      return acc;
    }, {});
  };

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowDistricts(true);
    setShowWards(false);
  };

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setShowWards(true);
  };

  const handleWardSelect = (
    ward: Ward,
    onLocationSelect: (location: string) => void,
    onClose: () => void
  ) => {
    setSelectedWard(ward);
    if (selectedProvince && selectedDistrict && ward) {
      const locationString = `${selectedProvince.name} | ${selectedDistrict.name} | ${ward.name}`;
      onLocationSelect(locationString);
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowDistricts(false);
    setShowWards(false);
  };

  return {
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
  };
};

export default useLocationSelect;
