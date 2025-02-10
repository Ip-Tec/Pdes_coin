import { useState } from "react";
import logo from "../assets/pdes.png";
import Navbar from "../components/Header";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import { ToastContainer, toast } from "react-toastify";

function ChangePassword() {
  const { isAuth, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    
    if (password == newPassword) {
      toast.error("Same password as old password");
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to change the password
      const response = await changePassword({
        oldPassword: password,
        newPassword,
      });

      if (response && response.message === "Password changed successfully") {
        toast.success("Password changed successfully!");
        logout()
        navigate("/login");
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } catch (error) {
      toast.error(`Failed to change password. Please try again.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG flex flex-col items-center justify-center mx-4">
      <ToastContainer />
      <img
        src={logo}
        alt="Logo"
        className={`mx-auto h-48 w-48 ${isLoading ? "hidden" : "block"}`}
      />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Change Password
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
              label="New Password"
              type="password"
              name="New Password"
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
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
       
      </div>
      {/* if user is authenticated, show the navbar */}
      {!isAuth ? <Navbar /> : null}
    </div>
  );
}

export default ChangePassword;
