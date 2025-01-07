import { useState } from "react";
import API from "../services/api";
import logo from "../assets/pdes.png";
import { motion } from "framer-motion";
import InputField from "../components/InputField";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [comfirmPassword, setComfirmPassword] = useState("");
  const [token] = useState("");
  const [stage, setStage] = useState<"email" | "reset" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
    //   const response = await API.post("/auth/forgot-password", { email });
      //   if (response.status === 200) {
      setStage("sent");
      setTimeout(() => setStage("reset"), 2000); // Move to reset password after 2 seconds
      //   }
    } catch (err: any) {
      setStage("sent");
      setTimeout(() => setStage("reset"), 2000);
      toast.error("Failed to send email.");
      setError(err.response?.data?.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    setLoading(true);
    // check if passwords match
    if (newPassword !== comfirmPassword) {
      toast.error("Passwords do not match.");
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await API.post("/auth/reset-password", {
        token,
        newPassword,
      });
      if (response.status === 200) {
        alert("Password reset successful!");
        // Optionally redirect to login page
      }
    } catch (err: any) {
      toast.error("Failed to reset password.");
      setError(err.response?.data?.message);
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
        className={`mx-auto h-64 animate-bounce w-64 ${
          stage == "sent" ? "hidden" : ""
        }`}
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
            {" "}
            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className={`w-2/3 py-2 mt-4 ${
                loading ? "bg-gray-400" : "bg-bgColor hover:bg-blue-600"
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
              type="password"
              label="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              name="newPassword"
            />
            <InputField
              type="password"
              label="Comfirm your new password"
              value={comfirmPassword}
              onChange={(e) => setComfirmPassword(e.target.value)}
              name="ComfirmPassword"
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            onClick={handleResetPassword}
            className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ForgotPassword;
