import { HiOutlineViewGridAdd } from "react-icons/hi";
import { AiOutlineShoppingCart } from "react-icons/ai"; // New icon for "Buy"
import { FaTag } from "react-icons/fa"; // New icon for "Sale"
import { FiSend } from "react-icons/fi";

const QuickActions = () => {
  const actions = [
    { icon: <FiSend />, label: "Send" },
    { icon: <AiOutlineShoppingCart />, label: "Buy" }, // Updated
    { icon: <FaTag />, label: "Sale" }, // Updated
    { icon: <HiOutlineViewGridAdd />, label: "More" },
  ];

  return (
    <div className="flex justify-between mt-4 space-x-3">
      {actions.map((action, index) => (
        <div
          key={index}
          className="flex flex-col cursor-pointer items-center hover:bg-primary bg-primary-light p-3 rounded-lg shadow"
        >
          <span className="text-xl">{action.icon}</span>
          <span className="text-sm">{action.label}</span>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
