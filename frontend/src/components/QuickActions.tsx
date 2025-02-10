import { useState } from "react";
import {
  FaTag,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { feURL } from "../services/api";
import { toast } from "react-toastify";

const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [link] = useState(feURL + "referral/re/" + user?.username);

  const handleAction = (label: string) => {
    if (label === "Withdraw") {
      navigate("/withdraw");
    } else if (label === "Buy") {
      navigate("/trade?buy");
    } else if (label === "Sale") {
      navigate("/trade?sell");
    } else if (label === "More") {
      setIsModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const actions = [
    { icon: <FiCreditCard />, label: "Withdraw" },
    { icon: <AiOutlineShoppingCart />, label: "Buy" },
    { icon: <FaTag />, label: "Sale" },
    { icon: <HiOutlineViewGridAdd />, label: "More" },
  ];

  return (
    <div>
      <div className="flex justify-between mt-4 space-x-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex w-24 flex-col cursor-pointer items-center hover:bg-primary bg-primary-light p-3 rounded-lg shadow"
            onClick={() => handleAction(action.label)}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Modal for More */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Share Your Link</h2>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={link} size={150} />
            </div>

            {/* Link and Copy Button */}
            <div className="flex flex-col items-center mb-4">
              <p className="text-sm break-all shadow-inner p-3 bg-bgColor rounded-lg text-gray-300">{link}</p>
              <button
                onClick={handleCopyLink}
                className="bg-secondary text-white px-4 py-2 mt-2 rounded-lg hover:bg-bgColor"
              >
                Copy Link
              </button>
            </div>

            {/* Social Media Share Buttons */}
            <div className="flex justify-around mt-4">
              <button
                className="text-blue-500"
                onClick={() =>
                  window.open(
                    `https://facebook.com/sharer/sharer.php?u=${link}`
                  )
                }
              >
                <FaFacebook size={24} />
              </button>
              <button
                className="text-blue-400"
                onClick={() =>
                  window.open(`https://x.com/intent/tweet?url=${link}`)
                }
              >
                <FaTwitter size={24} />
              </button>
              <button
                className="text-blue-600"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/shareArticle?url=${link}`
                  )
                }
              >
                <FaLinkedin size={24} />
              </button>
              <button
                className="text-green-500"
                onClick={() => window.open(`https://wa.me/?text=${link}`)}
              >
                <FaWhatsapp size={24} />
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-bgColor text-white px-4 py-2 mt-6 rounded-lg hover:bg-gray-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
