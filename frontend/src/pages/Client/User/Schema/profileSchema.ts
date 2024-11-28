import Joi from 'joi';
import validator from 'validator';

// Schema xác thực cập nhật thông tin profile
export const profileUpdateSchema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Name is required',
	}),
	avt: Joi.string().uri().required().messages({
		'string.empty': 'Avatar is required',
		'string.uri': 'Avatar must be a valid URL',
	}),
	bio: Joi.string().optional().allow(''), // Cho phép để trống, có thể thêm kiểm tra nếu cần
	birth_date: Joi.string()
		.pattern(/^\d{4}-\d{2}-\d{2}$/) // Kiểm tra đúng định dạng YYYY-MM-DD
		.required()
		.messages({
			'string.empty': 'Birth date is required',
			'string.pattern.base': 'Birth date must be in the format YYYY-MM-DD', // Chỉnh lại thông báo
		}),
	gender: Joi.string().valid('male', 'female').required().messages({
		'string.empty': 'Gender is required',
		'any.only': 'Gender must be either male or female',
	}),
	current_password: Joi.string().optional().allow(''), // Không bắt buộc
	new_password: Joi.string().min(6).optional().allow('').messages({
		'string.min': 'New password must be at least 6 characters long',
	}),
	confirm_password: Joi.any()
		.equal(Joi.ref('new_password'))
		.optional()
		.allow('')
		.messages({
			'any.only': 'Confirm password must match the new password',
		}),
	email: Joi.string()
		.custom((value, helper) => {
			if (!validator.isEmail(value)) {
				return helper.message({
					'string.email': 'Invalid email format',
				});
			}
			return value;
		})
		.required()
		.messages({
			'string.empty': 'Email is required',
		}),
	phone: Joi.string()
		.pattern(/^[0-9]{10}$/) // Kiểm tra 10 chữ số
		.optional()
		.allow('')
		.messages({
			'string.empty': 'Phone number is required',
			'string.pattern.base': 'Phone number must be 10 digits',
		}),
	address: Joi.string().optional().allow(''), // Cho phép để trống
});
