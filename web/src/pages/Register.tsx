import logo from "../assets/pdes.png";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";

const Register: React.FC = () => {
    const { isAuth } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

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
          console.log("Registration Error: ", { error });
          console.log("Registration Error: ", error.stack
          );

          setErrorMessage(error.message || "Registration failed");
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#FBF0EC]">
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
          <img src={logo} alt="Logo" className="mx-auto h-56 w-56" />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          Create an Account
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="w-2/3 py-2 mt-4 bg-bgColor text-white rounded-3xl hover:bg-blue-600 transition duration-300"
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account?</span>{" "}
          <a href="/login" className="text-textColor hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
