import axios from "axios";

// Fetch list of provinces
export const fetchProvinces = async () => {
  try {
    const response = await axios.get(`https://provinces.open-api.vn/api/p/`);
    return response.data; // Ensure this returns an array of provinces
  } catch (error) {
    throw new Error("Không thể tải danh sách tỉnh/thành.");
  }
};

// Fetch districts based on province ID
export const fetchDistricts = async (provinceId: number) => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/p/${provinceId}?depth=2`
    );
    return response.data.districts; // Ensure this returns an array of districts
  } catch (error) {
    throw new Error("Không thể tải danh sách quận/huyện.");
  }
};

// Fetch wards based on district ID
export const fetchWards = async (districtId: number) => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
    );
    return response.data.wards; // Ensure this returns an array of wards
  } catch (error) {
    throw new Error("Không thể tải danh sách phường/xã.");
  }
};

export const searchLocation = async (query: string) => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/d/search/?q=${query}`
    );
    return response.data; // Ensure this returns an array of locations
  } catch (error) {
    throw new Error("Không thể tìm kiếm địa điểm.");
  }
};
