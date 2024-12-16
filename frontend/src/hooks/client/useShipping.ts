import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createShipping,
	deleteShipping,
	getAllShipping,
	updateShipping,
} from '../../services/client/shipping';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';

const addressSchema = Joi.object({
	name: Joi.string().min(3).max(50).required().messages({
		'string.base': 'Tên phải là một chuỗi',
		'string.min': 'Tên phải có ít nhất 3 ký tự',
		'string.max': 'Tên không được vượt quá 50 ký tự',
		'any.required': 'Tên không được bỏ trống',
		'string.empty': 'Tên không được bỏ trống',
	}),
	phone_number: Joi.string()
		.pattern(/^[0-9]{10,11}$/)
		.required()
		.messages({
			'string.pattern.base': 'Số điện thoại phải có 10 hoặc 11 chữ số',
			'any.required': 'Số điện thoại không được bỏ trống',
			'string.empty': 'Số điện thoại không được bỏ trống',
		}),
	address: Joi.string().required().messages({
		'any.required': 'Địa chỉ không được bỏ trống',
		'string.empty': 'Địa chỉ không được bỏ trống',
	}),
	address_detail: Joi.string().required().min(5).messages({
		'string.min': 'Chi tiết địa chỉ phải có ít nhất 5 ký tự',
		'any.required': 'Chi tiết địa chỉ không được bỏ trống',
		'string.empty': 'Chi tiết địa chỉ không được bỏ trống',
	}),
	is_default: Joi.boolean(),
});

interface IAddress {
	name: string;
	phone_number: string;
	address: string;
	address_detail: string;
	is_default: boolean;
}

export const useShipping = () => {
	const addressLimit = 6;
	const [selectedLocation, setSelectedLocation] = useState<string | null>(
		null
	);
	const [showPopup1, setShowPopup1] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
	const [editAddress, setEditAddress] = useState<any | null>(null);
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<IAddress>({
		resolver: joiResolver(addressSchema),
	});
	const queryClient = useQueryClient();

	// Lấy danh sách địa chỉ
	const { data: address, isLoading } = useQuery({
		queryKey: ['ADDRESS'],
		queryFn: getAllShipping,
	});

	// Xử lý việc tạo địa chỉ mới
	const createMutation = useMutation({
		mutationFn: createShipping,
		onSuccess: (data: any) => {
			toast.success(data.message);
			queryClient.invalidateQueries({
				queryKey: ['ADDRESS'],
			});
			setShowPopup(false);
			reset();
			setSelectedLocation(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create shipping address');
		},
	});

	useEffect(() => {
		if (editAddress) {
			reset({
				name: editAddress.shipping_detail.name,
				phone_number: editAddress.shipping_detail.phone_number,
				address: editAddress.shipping_detail.address,
				address_detail: editAddress.shipping_detail.address_detail,
				is_default: editAddress.is_default,
			});
		} else {
			reset({
				name: '',
				phone_number: '',
				address: '',
				address_detail: '',
				is_default: false,
			});
			setSelectedLocation(null);
		}
	}, [editAddress, reset]);

	// Xử lý việc cập nhật địa chỉ
	const updateMutation = useMutation({
		mutationFn: (data: any) => updateShipping(editAddress.id, data),
		onSuccess: (data: any) => {
			toast.success(data.message);
			queryClient.invalidateQueries({
				queryKey: ['ADDRESS'],
			});
			setShowPopup(false);
			reset();
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update shipping address');
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
		const confirm = window.confirm('Xác nhận xóa địa chỉ này?');
		if (confirm) {
			await deleteShipping(id);
			toast.success('Đã xóa địa chỉ');
			queryClient.invalidateQueries({
				queryKey: ['ADDRESS'],
			});
		}
	};

	// Hàm xử lý khi chọn địa chỉ
	const handleLocationSelect = (location: string) => {
		setSelectedLocation(location);
		setValue('address', location);
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
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [showPopup, showPopup1]);

	return {
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
