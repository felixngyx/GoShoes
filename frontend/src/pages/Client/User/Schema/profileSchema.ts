import Joi from 'joi';

export const profileSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })  // Tắt kiểm tra TLD
    .required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be between 10 and 15 digits',
    }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
  }),
  current_password: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters long',
  }),
  confirm_password: Joi.any()
    .equal(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Confirm password must match the new password',
      'string.empty': 'Confirm password is required',
    }),
});
