import { useState } from "react";

function Activity() {
  const [activeSection, setActiveSection] = useState("history");

  const toggleSection = (section: string) => {
    setActiveSection((prevSection) => (prevSection === section ? "" : section));
  };

  return (
    <div className="min-h-screen bg-mainBG pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="flex justify-around items-center border-b border-gray-200">
          <button
            className={`w-1/2 py-4 font-medium text-center ${
              activeSection === "history"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-700"
            }`}
            onClick={() => toggleSection("history")}
          >
            History
          </button>
          <button
            className={`w-1/2 py-4 font-medium text-center ${
              activeSection === "referral"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-700"
            }`}
            onClick={() => toggleSection("referral")}
          >
            Referral
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* History Section */}
        {activeSection === "history" && (
          <div className="bg-white px-4 py-3 mt-4 shadow-md rounded-md">
            <h2 className="text-lg font-bold mb-2">History</h2>
            <p>Here is the history content...</p>
          </div>
        )}

        {/* Referral Section */}
        {activeSection === "referral" && (
          <div className="bg-white px-4 py-3 mt-4 shadow-md rounded-md">
            <h2 className="text-lg font-bold mb-2">Referral</h2>
            <p>Here is the referral content...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activity;
