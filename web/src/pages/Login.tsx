import { useState } from "react";
import logo from "../assets/pdes.png";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuth } = useAuth();

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

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
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (validateForm()) {
      try {
        await login(formData.email, formData.password); // Now calling login from AuthContext
        navigate("/dashboard");
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message || "Login failed");
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#FBF0EC] relative overflow-x-hidden">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <img
            src={logo}
            alt="Loading"
            className="animate-bounce w-56 h-56"
          />
        </div>
      )}

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="mx-auto h-56 w-56" />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          Login to Your Account
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mt-1">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-2/3 py-2 mt-4 ${
                loading ? "bg-gray-400" : "bg-bgColor hover:bg-blue-600"
              } text-white rounded-3xl transition duration-300`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <Link to={"/register"} className="text-textColor hover:underline">
            Sign Up
          </Link>
        </div>
        {/* Forget Password */}
        <div className="mt-4 text-center">
          <Link to={"/forgot-password"} className="text-textColor hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
