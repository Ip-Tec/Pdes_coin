import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "../components/Header";

function ResetPassword() {
  const { isAuth } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);

      // Replace this with your API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Password reset successfully!");
      navigate("/login"); // Redirect to login page after success
    } catch (error) {
      toast.error(`Failed to reset password. Please try again /n ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-primary text-white font-bold rounded-md focus:outline-none focus:ring ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary-dark"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
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
