import { useState, useEffect } from "react";
import { forgetPassword, resetPassword } from "../services/api";
import logo from "../assets/pdes.png";
import { motion } from "framer-motion";
import InputField from "../components/InputField";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [comfirmPassword, setComfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [stage, setStage] = useState<"email" | "reset" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL if available
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromURL = urlParams.get("token");
    if (tokenFromURL) {
      setToken(tokenFromURL);
      setStage("reset");
    }
  }, [location]);

  // Handle sending reset link
  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      const response = await forgetPassword({ email });
      if (response.message === "Reset link sent to your email") {
        toast.success(response.message);
        setStage("sent");
      } else {
        toast.error(response.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "An unexpected error occurred.");
      } else {
        console.error("Unknown error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with token
  const handleResetPassword = async () => {
    setLoading(true);
    if (newPassword !== comfirmPassword) {
      toast.error("Passwords do not match.");
      setError("Passwords do not match.");
      return;
    }

    try {
      if (token) {
        const response = await resetPassword({
          email,
          token,
          newPassword,
          password: comfirmPassword,
        });
        if ("message" in response) {
          if (response.message === "Password reset successful") {
            toast.success(response.message);
            navigate("/login"); // Redirect to login page after successful reset
          } else {
            toast.error("Failed to reset password.");
          }
        }
      }
    } catch (err: unknown) {
      toast.error("Failed to reset password.");
      setError((err as Error)?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-screen justify-center h-screen bg-mainBG overflow-x-hidden">
      <ToastContainer />
      <img
        src={logo}
        alt="Logo"
        className={`mx-auto h-64 w-64 ${stage == "sent" ? "hidden" : ""}`}
      />

      {/* Email Input Stage */}
      {stage === "email" && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="p-6 w-sm w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4 text-bgColor">
            Forgot Password
          </h2>
          <div className="flex items-center rounded-md p-2 mb-4 relative">
            <InputField
              type="email"
              label="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex w-full items-center flex-col justify-center">
            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className={`w-2/3 py-2 mt-4 ${
                loading
                  ? "bg-gray-400"
                  : "bg-bgColor text-white hover:bg-secondary"
              } text-white rounded-3xl transition duration-300`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login">
              <button className="mt-4 text-textColor hover:underline ml-4">
                Back to Login
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Email Sent Stage */}
      {stage === "sent" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center"
        >
          <img src={logo} alt="Email Sent" className="w-56 h-56 mx-auto" />
          <h2 className="text-xl font-bold mt-4 text-stone-800">Email Sent!</h2>
          <p className="text-gray-700">Check your inbox for the reset link.</p>
        </motion.div>
      )}

      {/* Reset Password Stage */}
      {stage === "reset" && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="p-6 w-sm w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4 text-textPrimary">
            Reset Password
          </h2>
          <div className="flex flex-col w-full items-center rounded-md p-2 mb-4">
            <InputField
              type="email"
              label="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              required
            />{" "}
            <InputField
              type="password"
              label="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              name="newPassword"
              required
            />
            <InputField
              type="password"
              label="Confirm your new password"
              value={comfirmPassword}
              onChange={(e) => setComfirmPassword(e.target.value)}
              name="comfirmPassword"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <div className="flex w-full items-center flex-col justify-center">
            <button
              onClick={handleResetPassword}
              className="bg-bgColor text-white hover:bg-secondary px-4 py-2 rounded-full w-2/3 mt-4"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ForgotPassword;
