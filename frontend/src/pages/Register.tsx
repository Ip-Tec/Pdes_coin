import logo from "../assets/pdes.png";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const Register: React.FC = () => {
  const { isAuth } = useAuth();
  const { referralCode } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    referralCode,
    terms: false, // Changed to boolean for easier condition checking
  });

  const [loading, setLoading] = useState(false); // Loading state
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  }, [isAuth, navigate]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
      isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear the error for the field being edited
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await registerUser(formData);
        console.log("Registration Successful: ", response);
        setErrorMessage(""); // Clear error message on success
        navigate("/login"); // Redirect to dashboard on success
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Registration Error: ", { error });
          console.error("Registration Error: ", error.stack);

          setErrorMessage(error.message || "Registration failed");
          toast.error(error.message || "Registration failed");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF0EC]">
      <ToastContainer />
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <img
            src={logo}
            alt="Loading"
            className="animate-zoomInOut w-56 h-56"
          />
        </div>
      )}
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className={`mx-auto h-56 w-56 ${loading ? "hidden" : "block"}`}
          />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          Create an Account
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <p className="text-gray-700 text-sm mt-1 mx-auto w-full">
            Referral Code: re/{referralCode}
          </p>
          <input
            type="text"
            name="referralCode"
            readOnly
            defaultValue={referralCode}
            hidden
          />
          <InputField
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}

          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.checked })
              }
              className="mr-2 p-10 w-6 h-6  border-2 border-gray-300 rounded-md bg-slate-400 checked:bg-blue-500 checked:border-blue-500 checked:ring-2 checked:ring-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            />
            <label className="text-gray-700">
              I agree to the{" "}
              <Link to="/about" className="text-blue-500 hover:underline">
                terms and conditions
              </Link>
            </label>
          </div>

          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={!formData.terms} // Disable button if terms are not accepted
              className={`w-2/3 py-2 mt-4 bg-bgColor text-white rounded-3xl hover:bg-blue-600 transition duration-300 ${
                !formData.terms ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account?</span>{" "}
          <Link to="/login" className="text-textColor hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
