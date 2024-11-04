import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const ContactUs = () => {
  return (
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
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="input input-bordered w-full" 
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        className="input input-bordered w-full" 
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="How can we help you?" 
                      className="input input-bordered w-full" 
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Message</span>
                    </label>
                    <textarea 
                      className="textarea textarea-bordered h-32" 
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">I agree to the Terms & Conditions</span> 
                      <input type="checkbox" className="checkbox checkbox-primary" />
                    </label>
                  </div>

                  <button className="btn btn-primary btn-block">
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
  );
};

export default ContactUs;