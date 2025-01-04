import { useState } from "react";
import { FaTag } from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { AiOutlineShoppingCart } from "react-icons/ai";

const QuickActions = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = (label: string) => {
    if (label === "Withdraw") {
      navigate("/withdraw");
    } else if (label === "Buy") {
      navigate("/trade");
    } else if (label === "Sale") {
      navigate("/trade");
    } else if (label === "More") {
      setIsModalOpen(true);
    }
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
            <h2 className="text-lg font-bold mb-4">More Options</h2>
            <p className="text-sm mb-6">
              Additional options will be added soon.
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
