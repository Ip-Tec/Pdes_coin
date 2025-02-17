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

    // Disable background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Trigger the slide-out animation
    setTimeout(onClose, 300); // Wait for animation to complete before closing
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
        className={`fixed top-0 right-0 w-full md:w-[30%] h-screen bg-white shadow-lg transition-transform duration-300 transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={handleClose}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-28 h-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default SlideInPanel;
