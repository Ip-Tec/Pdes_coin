import { User } from "../utils/type";
import { useState, useEffect } from "react";
import { formattedMoneyUSD } from "../utils/helpers";
import { getTransactionHistory, fetchUserReferralList } from "../services/api";

function Activity() {
  const [activeSection, setActiveSection] = useState("history");
  const [historyData, setHistoryData] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSection = (section: string) => {
    setActiveSection((prevSection) => (prevSection === section ? "" : section));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        if (activeSection === "history") {
          const data = await getTransactionHistory();
          setHistoryData(data);
        } else if (activeSection === "referral") {
          // Replace with the actual API call for referrals if available
          const data = await fetchUserReferralList(); // Example data

          console.log({ data });

          setReferralData(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    if (activeSection) {
      fetchData();
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen max-w-lg m-auto w-auto bg-mainBG pb-16 text-gray-600">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md max-w-lg m-auto w-full z-10">
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
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : activeSection === "history" ? (
          <div className="bg-white px-4 py-3 mt-4 shadow-md rounded-md">
            <h2 className="text-lg font-bold mb-2">History</h2>
            {historyData.length > 0 ? (
              <ul>
                {historyData.map((item: any, index: number) => (
                  <li
                    key={index}
                    className={`py-2 border-b-2 border-gray-200 ${
                      item.transaction_type == "deposite"
                        ? "border-bgColor"
                        : "border-red-600"
                    }`}
                  >
                    <span className="flex justify-between">
                      {item.account_name.toUpperCase()}{" "}
                      {new Date(item.created_at).toDateString()}
                    </span>
                    <span className="flex">
                      Transaction Type: {item.transaction_type}
                    </span>
                    <span className="flex">
                      Amount: {formattedMoneyUSD(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transaction history available.</p>
            )}
          </div>
        ) : (
          <div className="bg-white px-4 py-3 mt-4 shadow-md rounded-md">
            <h2 className="text-lg font-bold mb-2">Referral</h2>
            {referralData.length > 0 ? (
              <ul>
                {referralData.map((item: User, index: number) => (
                  <li
                    key={index}
                    className={` py-2 border-b-2 border-gray-500 mb-2 ${
                      item.balance > 0 ? "border-bgColor" : "border-red-600"
                    }`}
                  >
                    <p>{item.full_name.toUpperCase()}</p>
                    Referral ID: {item.username} - Reward:{" "}
                    {item.referral_reward}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No referral data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Activity;
