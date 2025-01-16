import { useState } from "react";
import logo from "../assets/pdes.png";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "../components/Header";
import InputField from "../components/InputField";
import { resetPassword } from "../services/api";

function ResetPassword() {
  const { isAuth } = useAuth();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (password !== newPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);

      // Replace this with your API call for password reset
      const response = await resetPassword({ newPassword, password });
      if (response) {
        toast.success("Password reset successfully!");
      } else {
        toast.error("Failed to reset password. Please try again");
      }

      navigate("/login");
    } catch (error) {
      toast.error(`Failed to reset password. Please try again /n ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG flex flex-col items-center justify-center mx-4">
      <ToastContainer />
      <img src={logo} alt="Logo" className={`mx-auto h-64 w-64 ${isLoading ? "hidden" : "block"}`} />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="w-full pt-4 justify-center items-center flex flex-col">
            <button
              type="submit"
              className={`w-[85%] mx-auto py-2 px-4 bg-primary text-white font-bold rounded-3xl focus:outline-none focus:ring ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-dark"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
      {/* if user is authenticated, show the navbar */}
      {!isAuth ? <Navbar /> : null}
    </div>
  );
}
export default ResetPassword;
