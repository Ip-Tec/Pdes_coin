import { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../components/InputField";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "../components/NavigationBar";

function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { isAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate an API call
      setTimeout(() => {
        toast.success("Your message has been sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            "Failed to send your message. Please try again later."
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG py-8 px-4">
      <ToastContainer />

      {/* Back Button */}
      <button
        className="flex items-center text-primary mb-4 md:hidden"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>

      <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-lg p-6 mb-24">
        <h1 className="text-3xl font-bold text-center text-primary mb-4">
          Support Center
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Need help? Contact us or send a message below.
        </p>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <FaPhone size={32} className="text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Phone</h3>
            <p className="text-gray-600">+1-234-567-890</p>
          </div>
          <div className="text-center">
            <FaEnvelope size={32} className="text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Email</h3>
            <p className="text-gray-600">support@pdescoin.com</p>
          </div>
          <div className="text-center">
            <FaMapMarkerAlt size={32} className="text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Address</h3>
            <p className="text-gray-600">123 PDES St, Crypto City</p>
          </div>
        </div>

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="Your Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <InputField
              label="Your Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-gray-700 font-medium"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
        bg-slate-300 text-textColor placeholder-gray-500 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
              placeholder="Type your message here"
            ></textarea>
          </div>
          <button
            type="submit"
            className={`w-full py-2 bg-primary text-white rounded-md shadow-md ${
              isSubmitting ? "opacity-50" : "hover:bg-primary-dark"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
      {isAuth && <Navigation />}
    </div>
  );
}

export default SupportPage;
