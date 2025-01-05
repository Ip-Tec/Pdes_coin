import logo from "../assets/pdes.png";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "../components/NavigationBar";
import { AccountAPI } from "../services/api";
import { AccountDetail } from "../utils/type";
import { ToastContainer, toast } from "react-toastify";

interface RespondDATA {
  error: string;
  message: string;
  data?: AccountDetail;
}
function Profile() {
  const { user, logout, isAuth } = useAuth();
  const [animationClass, setAnimationClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [accountData, setAccountData] = useState<AccountDetail>();
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

  const handleWalletAddressClick = async () => {
    try {
      setIsLoading(true);
      const response = await AccountAPI.getAccount();
      if (!response) {
        toast.error(response);
      }
      setAccountData(response);

      setIsAccordionOpen(!isAccordionOpen);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userProfile = {
    id: user?.id,
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
      <ToastContainer />
      {/* User Information Card */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">User Info</h2>
            <span className="text-sm cursor-pointer" onClick={copyToClipboard}>
              <span>Referral Code: {userProfile.referralCode}</span>
              <span>https://pdes.xyz/referral/{userProfile.referralCode}</span>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{userProfile.name}</p>
            <span>Referral Code: {userProfile.accountNumber}</span>
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
          "Wallet Address",
          "Reset Password",
          "Logout",
        ].map((item, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg shadow-md w-full bg-white cursor-pointer ${
              item === "Logout"
                ? "text-red-500 hover:text-red-700"
                : "text-gray-700 hover:text-primary"
            }`}
          >
            {item === "Wallet Address" ? (
              <div>
                <div
                  onClick={handleWalletAddressClick}
                  className="cursor-pointer"
                >
                  {item}
                </div>
                {isAccordionOpen && accountData && (
                  <div className="mt-2 bg-gray-100 text-left rounded-md shadow-inner text-md">
                    <h3 className="text-lg font-bold mb-2">Account Details</h3>
                    <p className="">
                      <strong>BTC Address:</strong> {accountData.BTC}
                    </p>
                    <p>
                      <strong>ETH Address:</strong> {accountData.ETH}
                    </p>
                    <p>
                      <strong>BCH Address:</strong> {accountData.BTC}
                    </p>
                    {/* <p>
                      <strong>USDC Address:</strong> {accountData.USDC}
                    </p> */}
                    <p>
                      <strong>PDES Address:</strong> {accountData.PDES}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={
                  item === "Reset Password"
                    ? toggleModal
                    : item === "Logout"
                    ? handleLogout
                    : undefined
                }
              >
                {item}
              </div>
            )}
          </div>
        ))}
      </div>

      <Navigation />
    </div>
  );
}

export default Profile;
