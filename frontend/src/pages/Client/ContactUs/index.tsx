import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"; // Adjust the path as necessary
import Joi from "joi";
import axiosClient from "../../../apis/axiosClient";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { toast } from "react-hot-toast";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    agree: false,
  });

  interface FormErrors {
    fullName?: string;
    email?: string;
    subject?: string;
    message?: string;
    agree?: string;
  }

  const [errors, setErrors] = useState<FormErrors>({});

  const schema = Joi.object({
    fullName: Joi.string().required().label("Full Name"),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label("Email"),
    subject: Joi.string().required().label("Subject"),
    message: Joi.string().required().label("Message"),
    agree: Joi.boolean().valid(true).required().label("Terms & Conditions"),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = schema.validate(formData, { abortEarly: false });
    if (error) {
      const errorMessages = {};
      error.details.forEach((detail) => {
        errorMessages[detail.path[0]] = detail.message;
      });
      setErrors(errorMessages);
      return;
    }
    setErrors({});
    try {
      const response = await axiosClient.post("/contacts", {
        full_name: formData.fullName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      if (response.data.success) {
        toast.success("Message sent successfully!");
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: "",
          agree: false,
        });
      } else {
        toast.error(response.data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Trang chủ", link: "" },
          { name: "Liên hệ", link: "contact" },
        ]}
      />
      <div className="min-h-screen bg-base-200 py-12 px-4">
        {/* Hero Section */}
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6">
                    Thông Tin Liên Hệ
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold mb-1">Điện Thoại</h3>
                        <p className="text-sm">+84 900 826 8686</p>
                        <p className="text-sm">+84 900 832 8686</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-sm">contact@goshoes.com</p>
                        <p className="text-sm">support@goshoes.com</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold mb-1">Địa Chỉ</h3>
                        <p className="text-sm">999 Hà Nội</p>
                        <p className="text-sm">Việt Nam</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold mb-1">Giờ Làm Việc</h3>
                        <p className="text-sm">
                          Thứ 2 - Thứ 6: 9:00 AM - 6:00 PM
                        </p>
                        <p className="text-sm">Thứ 7 - Chủ Nhật: Nghỉ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6">
                    Gửi Tin Nhắn Cho Chúng Tôi
                  </h2>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Họ Tên</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Nguyễn Văn A"
                          className="input input-bordered w-full"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="nguyenvana@example.com"
                          className="input input-bordered w-full"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Chủ Đề</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="Chúng tôi có thể giúp gì cho bạn?"
                        className="input input-bordered w-full"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Tin Nhắn</span>
                      </label>
                      <textarea
                        name="message"
                        className="textarea textarea-bordered h-32"
                        placeholder="Viết tin nhắn của bạn ở đây..."
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          Tôi đồng ý với Điều Khoản & Điều Kiện
                        </span>
                        <input
                          type="checkbox"
                          name="agree"
                          className="checkbox checkbox-primary"
                          checked={formData.agree}
                          onChange={handleChange}
                        />
                      </label>
                      {errors.agree && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.agree}
                        </p>
                      )}
                    </div>
                    <button className="btn btn-primary btn-block" type="submit">
                      <Send className="h-4 w-4 mr-2" />
                      Gửi Tin Nhắn
                    </button>
                  </form>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Câu Hỏi Thường Gặp
                </h2>
                <div className="max-w-3xl mx-auto">
                  <div className="join join-vertical w-full bg-white shadow-xl rounded-lg">
                    <div className="collapse collapse-arrow join-item border border-base-300">
                      <input
                        type="radio"
                        name="my-accordion-4"
                        checked={true}
                      />
                      <div className="collapse-title text-xl font-medium">
                        Giờ làm việc của bạn là gì?
                      </div>
                      <div className="collapse-content">
                        <p>
                          Chúng tôi mở cửa từ thứ 2 đến thứ 6 từ 9:00 AM đến
                          6:00 PM. Chúng tôi đóng cửa vào cuối tuần và các ngày
                          lễ lớn.
                        </p>
                      </div>
                    </div>
                    <div className="collapse collapse-arrow join-item border border-base-300">
                      <input type="radio" name="my-accordion-4" />
                      <div className="collapse-title text-xl font-medium">
                        Bạn phản hồi các yêu cầu nhanh như thế nào?
                      </div>
                      <div className="collapse-content">
                        <p>
                          Chúng tôi thường phản hồi tất cả các yêu cầu trong
                          vòng 24 giờ làm việc. Đối với các vấn đề khẩn cấp, vui
                          lòng gọi đường dây hỗ trợ của chúng tôi.
                        </p>
                      </div>
                    </div>
                    <div className="collapse collapse-arrow join-item border border-base-300">
                      <input type="radio" name="my-accordion-4" />
                      <div className="collapse-title text-xl font-medium">
                        Bạn có cung cấp hỗ trợ khẩn cấp không?
                      </div>
                      <div className="collapse-content">
                        <p>
                          Có, chúng tôi cung cấp hỗ trợ khẩn cấp 24/7 cho khách
                          hàng cao cấp của chúng tôi. Hỗ trợ tiêu chuẩn có sẵn
                          trong giờ làm việc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
