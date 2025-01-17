import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const SlideInPanel = ({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Trigger the slide-in animation when the component mounts
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Trigger the slide-out animation
    setTimeout(onClose, 300); // Wait for the animation to complete before closing
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose} // Close panel when overlay is clicked
      ></div>

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 w-full md:w-[40%] h-screen bg-white shadow-lg transition-transform duration-300 transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b relative">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
            onClick={handleClose}
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default SlideInPanel;
