import { useState } from "react";
import logo from "../assets/pdes.png";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { User } from "../utils/type";
import { getUser } from "../services/api";

interface LoginResponse {
  user: User | null; // Update the type to match your actual user type
  access_token?: string | null;
  refresh_token?: string | null;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuth, user } = useAuth();

  if (isAuth && user) {
    if (user?.role !== "user") {
      return <Navigate to="/a/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
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

  const loginUser = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    await login(email, password);
    const user = await getUser();
    if (!user) {
      throw new Error("User not found");
    }
    return { user };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (validateForm()) {
      try {
        const loginResponse = await loginUser(
          formData.email,
          formData.password
        );
        // const  = user;
        const { user, access_token, refresh_token } = loginResponse;
        console.log("Login page:",{ user, access_token, refresh_token });
        if (loginResponse?.user?.role !== "user") {
          navigate("/a/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Login failed");
          setErrorMessage(error.message || "Login failed");
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
    <div className="min-h-screen flex items-center justify-center bg-[#FBF0EC] relative overflow-x-hidden">
      <ToastContainer />
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <img src={logo} alt="Loading" className="animate-bounce w-56 h-56" />
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
          <Link
            to={"/forgot-password"}
            className="text-textColor hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
