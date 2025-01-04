import logo from "../assets/pdes.png";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "../components/NavigationBar";

function Profile() {
  const { user, logout, isAuth } = useAuth(); // Use context to get user data and authentication status
  const [animationClass, setAnimationClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  const handleLogoClick = () => {
    setAnimationClass("animate-logo");
    setTimeout(() => setAnimationClass(""), 1000);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userProfile = {
    name: user?.full_name, // Access user data from context
    email: user?.email,
    accountNumber: user?.username,
    referralCode: user?.referral_code, // Add referral code to user profile
  };

  const copyToClipboard = async () => {
    const referralLink = `https://pdes.xyz/referral/${userProfile.referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink); // Copy the referral link to clipboard
      alert("Referral link copied to clipboard!"); // Show success message
    } catch (error) {
      console.error("Failed to copy referral link", error);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG pb-16">
      {/* User Information Card */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">User Info</h2>
            <span className="text-sm cursor-pointer" onClick={copyToClipboard}>
              <span></span>Referral Code: {userProfile.referralCode}
              <span>https://pdes.xyz/referral/{userProfile.referralCode}</span>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{userProfile.name}</p>
            <p className="text-sm">{userProfile.email}</p>
            <div className="text-lg tracking-widest font-mono mt-4">
              {userProfile.accountNumber}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <img
              src={logo}
              alt="Bank Logo"
              className={`h-20 cursor-pointer ${animationClass}`}
              onClick={handleLogoClick}
            />
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="flex flex-wrap flex-col md:flex-row justify-evenly items-center text-center m-auto px-4 py-4 gap-4 md:gap-1">
        {[
          "About",
          "Support",
          "Help Center",
          "Wallet",
          "Reset Password",
          "Logout",
        ].map((item, index) => (
          <div
            key={index}
            onClick={
              item === "Reset Password"
                ? toggleModal
                : item === "Logout"
                ? handleLogout
                : undefined
            } // Handle logout
            className={`p-4 rounded-lg shadow-md w-full md:w-[40%] md:h-[8rem] text-center bg-white cursor-pointer ${
              item === "Logout"
                ? "text-red-500 hover:text-red-700"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] md:w-[400px] shadow-lg">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Old Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}

export default Profile;
