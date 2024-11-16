import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createShipping,
  deleteShipping,
  getAllShipping,
  updateShipping,
} from "../../services/client/shipping";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export const useShipping = () => {
  const addressLimit = 6;
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [editAddress, setEditAddress] = useState<any | null>(null);
  const { register, handleSubmit, setValue, reset } = useForm();
  const queryClient = useQueryClient();

  // Lấy danh sách địa chỉ
  const { data: address, isLoading } = useQuery({
    queryKey: ["ADDRESS"],
    queryFn: getAllShipping,
  });

  // Xử lý việc tạo địa chỉ mới
  const createMutation = useMutation({
    mutationFn: createShipping,
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["ADDRESS"],
      });
      setShowPopup(false);
      reset();
      setSelectedLocation(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipping address");
    },
  });

  // Xử lý việc cập nhật địa chỉ
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateShipping(editAddress.id, data),
    onSuccess: (data: any) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["ADDRESS"],
      });
      setShowPopup(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping address");
    },
  });

  // Hàm submit form
  const onSubmit = (data: any) => {
    if (editAddress) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Xử lý việc xóa địa chỉ
  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete");
    if (confirm) {
      await deleteShipping(id);
      toast.success("Shipping address deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["ADDRESS"],
      });
    }
  };

  // Hàm xử lý khi chọn địa chỉ
  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setValue("address", location);
    setShowPopup1(false);
  };

  // Chỉnh sửa địa chỉ
  const handleEdit = (address: any) => {
    setEditAddress(address); // Lưu lại địa chỉ cần chỉnh sửa
    setSelectedLocation(address.shipping_detail.address); // Chọn địa chỉ đã lưu
    setShowPopup(true); // Mở form chỉnh sửa
  };

  // Điều chỉnh overflow khi mở/đóng popup
  useEffect(() => {
    if (showPopup || showPopup1) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup, showPopup1]);

  return {
    address,
    isLoading,
    selectedLocation,
    showPopup,
    showPopup1,
    addressLimit,
    setEditAddress,
    register,
    handleSubmit,
    setValue,
    onSubmit,
    handleLocationSelect,
    setShowPopup,
    handleDelete,
    setShowPopup1,
    handleEdit, // Thêm hàm xử lý chỉnh sửa địa chỉ
    editAddress, // Thêm editAddress vào để biết khi nào đang chỉnh sửa
  };
};
