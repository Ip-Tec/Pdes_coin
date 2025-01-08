import { FiHome, FiActivity, FiCreditCard, FiUser } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation(); // Get the current location

  const navItems = [
    { icon: <FiHome />, label: "Home", path: "/dashboard" },
    { icon: <FiCreditCard />, label: "Withdraw", path: "/withdraw" },
    { icon: <FiActivity />, label: "Activity", path: "/activity" },
    { icon: <FiUser />, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-3 md:py-1">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col rounded-full items-center p-4 text-gray-500 hover:bg-primary-light hover:text-text focus:text-text ${
              location.pathname === item.path ? "bg-primary text-white" : ""
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
