import { Profile, ProfileParams } from '../../types/client/profile';
import axiosClient from '../../apis/axiosClient';

// Các interface liên quan
export interface VerifyEmailChangeRequest {
  token: string;
  email: string;
}

export interface VerifyPhoneChangeRequest {
  token: string;
  phone: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyTokenRequest {
  token: string;
  type: 'reset-password';
}

// =================== API XỬ LÝ MẬT KHẨU ===================

// Gửi yêu cầu reset mật khẩu
export const sendResetPasswordRequest = async (params: ResetPasswordRequest): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/reset-password-request', params);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Gửi yêu cầu reset mật khẩu thất bại');
    }
  } catch (error) {
    console.error('Error while sending reset password request:', error);
    throw error;
  }
};

// Xác minh token reset mật khẩu
export const verifyTokenForResetPassword = async (params: VerifyTokenRequest): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/verify-token', params);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Verification failed');
    }
  } catch (error: any) {
    if (error.response) {
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error('No response from server:', error.request);
    } else {
      // Lỗi khác
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Đặt lại mật khẩu mới
export const resetPassword = async (params: ResetPasswordParams): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/reset-password', params);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Đặt lại mật khẩu thất bại');
    }
  } catch (error) {
    console.error('Error while resetting password:', error);
    throw error;
  }
};

// =================== API XỬ LÝ EMAIL & SĐT ===================

// Gửi yêu cầu thay đổi email
export const sendEmailChangeRequest = async (): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/change-detail-request', {
      type: 'change-email',
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Gửi yêu cầu thay đổi email thất bại');
    }
  } catch (error) {
    console.error('Error while sending email change request:', error);
    throw error;
  }
};

// Gửi yêu cầu thay đổi số điện thoại
export const sendPhoneChangeRequest = async (): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/change-detail-request', {
      type: 'change-phone',
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Gửi yêu cầu thay đổi số điện thoại thất bại');
    }
  } catch (error) {
    console.error('Error while sending phone change request:', error);
    throw error;
  }
};

// Xác minh token thay đổi email
export const verifyTokenChangeEmail = async (
  params: VerifyEmailChangeRequest
): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/verify-token-change-email', params);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Xác minh token thay đổi email thất bại');
    }
  } catch (error) {
    console.error('Error while verifying email change token:', error);
    throw error;
  }
};

// Xác minh token thay đổi số điện thoại
export const verifyTokenChangePhone = async (
  params: VerifyPhoneChangeRequest
): Promise<void> => {
  try {
    const response = await axiosClient.post('/profile/verify-token-change-phone', params);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Xác minh token thay đổi số điện thoại thất bại');
    }
  } catch (error) {
    console.error('Error while verifying phone change token:', error);
    throw error;
  }
};

// =================== API XỬ LÝ HỒ SƠ ===================

// Hàm lấy thông tin hồ sơ người dùng
export const getProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosClient.get('/profile');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lấy thông tin profile thất bại');
    }
  } catch (error) {
    console.error('Error while fetching profile:', error);
    throw error;
  }
};

// Hàm cập nhật thông tin hồ sơ người dùng
export const updateProfile = async (params: ProfileParams): Promise<Profile> => {
  try {
    const response = await axiosClient.put('/profile/update', params);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Cập nhật thông tin profile thất bại');
    }
  } catch (error) {
    throw error;
  }
};
