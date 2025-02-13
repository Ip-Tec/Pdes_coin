import logo from "../assets/pdes.png";
// import { motion } from "framer-motion";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
// import { AccountAPI } from "../services/api";
// import { AccountDetail } from "../utils/type";
import { MdChevronRight } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  FaInfoCircle,
  FaWallet,
  FaSignOutAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { feURL } from "../services/api";
function Profile() {
  const { user, setUser, logout, isAuth } = useAuth();
  const [animationClass, setAnimationClass] = useState("");
  const [isLoading] = useState(false);
  // const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  // const [accountData, setAccountData] = useState<AccountDetail>();
  const navigate = useNavigate();
  const referralLink = `${feURL}referral/re/${user?.username}`;

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
    if (!user) {
      navigate("/login");
    }
  }, [isAuth, navigate, setUser, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mainBG">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  const handleLogoClick = () => {
    setAnimationClass("animate-logo");
    setTimeout(() => setAnimationClass(""), 1000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // const handleWalletAddressClick = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await AccountAPI.getAccount();
  //     if (!response) {
  //       toast.error("Failed to fetch account details");
  //     }
  //     setAccountData(response);
  //     setIsAccordionOpen(!isAccordionOpen);
  //   } catch (error) {
  //     toast.error(`Failed to fetch account data: ${error}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    } catch (error) {
      toast.error(`Failed to copy referral link: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-mainBG text-gray-600 pb-16 mb-28">
      <ToastContainer />
      <div className="container mx-auto px-4">
        {/* User Info Section */}
        <div className="max-w-xl mx-auto mt-8 bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">User Info</h2>
            <button
              onClick={copyToClipboard}
              title={referralLink}
              className="text-sm underline focus:outline-none"
            >
              Copy Referral
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{user?.full_name}</p>
            <p className="text-sm">{user?.email}</p>
            <p className="text-sm">{user?.username}</p>
          </div>

          <div className="flex justify-between mt-4">
            {/* Reset Password Button */}
            <Link to="/reset-password">
              <button className="mt-4 px-4 py-2 bg-white rounded-lg shadow-md text-center w-full md:w-40 text-gray-700 hover:text-primary">
                Reset Password
              </button>
            </Link>

            <img
              src={logo}
              alt="Bank Logo"
              className={`h-20 cursor-pointer ${animationClass}`}
              onClick={handleLogoClick}
            />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-wrap justify-center mt-8 gap-4">
          {/* Grouped Card for Support and Help Center */}
          <div className="bg-white rounded-lg shadow-md p-4 text-center w-full md:w-40">
            <h3 className="text-lg font-semibold text-gray-700">
              Support & Help
            </h3>
            <button
              onClick={() => navigate("/support")}
              className="mt-2 w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <FaQuestionCircle size={20} /> Support
              </span>
              <MdChevronRight size={20} />
            </button>
            <button
              onClick={() => navigate("/help-center")}
              className="mt-2 w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <FaInfoCircle size={20} /> Help Center
              </span>
              <MdChevronRight size={20} />
            </button>
          </div>

          {/* Other Navigation Buttons */}
          {[
            {
              label: "About",
              action: () => navigate("/about"),
              leftIcon: <FaInfoCircle size={20} />,
              rightIcon: <MdChevronRight size={20} />,
            },
            {
              label: "Wallet",
              action: () => navigate("/wallet"),
              leftIcon: <FaWallet size={20} />,
              rightIcon: <MdChevronRight size={20} />,
            },
            // {
            //   label: "Wallet Address",
            //   action: handleWalletAddressClick,
            //   leftIcon: <FaWallet size={20} />,
            //   rightIcon: <MdChevronRight size={20} />,
            // },
            {
              label: "Logout",
              action: handleLogout,
              leftIcon: <FaSignOutAlt size={20} />,
              rightIcon: <MdChevronRight size={20} />,
              style: "text-red-500 hover:text-red-700",
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-md text-center w-full md:w-40 text-gray-700 hover:text-primary ${
                item.style || ""
              }`}
            >
              <span className="flex items-center gap-2">
                {item.leftIcon} {item.label}
              </span>
              {item.rightIcon}
            </button>
          ))}
        </div>
        {/* Wallet Accordion */}
        {/* {isAccordionOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-8 max-w-xl mx-auto bg-gray-100 p-4 rounded-lg shadow-md"
          >
            {isLoading ? (
              <Loading isLoading={isLoading} />
            ) : accountData ? (
              <>
                <h3 className="text-lg font-bold mb-2 text-gray-600">
                  Account Details
                </h3>
                <p className="text-gray-800">
                  <strong>PDES/BTC Address:</strong> {accountData.BTC}
                </p>
                <p className="text-gray-800">
                  <strong>PDES/ETH Address:</strong> {accountData.ETH}
                </p>
                <p className="text-gray-800">
                  <strong>PDES/BCH Address:</strong> {accountData.BTC}
                </p>
                {/* <p className="text-gray-800">
                  <strong>PDES Address:</strong> {accountData.PDES}
                </p> 
              </>
            ) : (
              <p className="text-gray-600">No account data available.</p>
            )}
          </motion.div>
        )} */}
        {["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"].includes(
          user?.role.toUpperCase() || ""
        ) && (
          <Link to="/a/dashboard">
            <button className="mt-4 px-4 py-2 bg-white rounded-lg shadow-md text-center w-full md:w-40 text-gray-700 hover:text-primary">
              Admin Dashboard
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Profile;
