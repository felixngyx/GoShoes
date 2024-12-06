import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'; // Adjust the path as necessary
import Joi from 'joi';
import axiosClient from '../../../apis/axiosClient';
import Breadcrumb from '../../../components/client/Breadcrumb';
import { toast } from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
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
    fullName: Joi.string().required().label('Full Name'),
    email: Joi.string().email({ tlds: { allow: false } }).required().label('Email'),
    subject: Joi.string().required().label('Subject'),
    message: Joi.string().required().label('Message'),
    agree: Joi.boolean().valid(true).required().label('Terms & Conditions'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
      const response = await axiosClient.post('/contacts', {
        full_name: formData.fullName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      if (response.data.success) {
        toast.success('Message sent successfully!');
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          message: '',
          agree: false,
        });
      } else {
        toast.error(response.data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <>
     <Breadcrumb
        items={[
          { name: "Home", link: "" },
          { name: "Contact", link: "contact" },
        ]}
      />
    <div className="min-h-screen bg-base-200 py-12 px-4">
      {/* Hero Section */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold mb-1">Phone</h3>
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
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-sm">999 Ha Noi City</p>
                      <p className="text-sm">Viet Nam</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold mb-1">Working Hours</h3>
                      <p className="text-sm">Mon - Fri: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm">Sat - Sun: Closed</p>
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
                <h2 className="card-title text-2xl mb-6">Send us a Message</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        className="input input-bordered w-full"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="How can we help you?"
                      className="input input-bordered w-full"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Message</span>
                    </label>
                    <textarea
                      name="message"
                      className="textarea textarea-bordered h-32"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">I agree to the Terms & Conditions</span>
                      <input
                        type="checkbox"
                        name="agree"
                        className="checkbox checkbox-primary"
                        checked={formData.agree}
                        onChange={handleChange}
                      />
                    </label>
                    {errors.agree && <p className="text-red-500 text-xs mt-1">{errors.agree}</p>}
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <div className="join join-vertical w-full">
              <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="my-accordion-4" checked={true} />
                <div className="collapse-title text-xl font-medium">
                  What are your business hours?
                </div>
                <div className="collapse-content">
                  <p>We're open Monday through Friday from 9:00 AM to 6:00 PM. We're closed on weekends and major holidays.</p>
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="my-accordion-4" />
                <div className="collapse-title text-xl font-medium">
                  How quickly do you respond to inquiries?
                </div>
                <div className="collapse-content">
                  <p>We typically respond to all inquiries within 24 business hours. For urgent matters, please call our support line.</p>
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="my-accordion-4" />
                <div className="collapse-title text-xl font-medium">
                  Do you offer emergency support?
                </div>
                <div className="collapse-content">
                  <p>Yes, we offer 24/7 emergency support for our premium customers. Standard support is available during business hours.</p>
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