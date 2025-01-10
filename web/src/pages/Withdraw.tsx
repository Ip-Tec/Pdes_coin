import { useEffect, useState } from "react";
import logo from "../assets/pdes.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API, { apiUrl, withdrawFunds } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

function Withdraw() {
  const { user } = useAuth();
  const userBalance = user?.balance || 0;
  const withdrawalLimit = 100;
  const [selectedOption, setSelectedOption] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Opay");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();
  const [conversionRate, setConversionRate] = useState<number>(2000);

  // Fetch conversion rate from API
  useEffect(() => {
    async function fetchConversionRate() {
      try {
        const response = await API.get(apiUrl("/transactions/conversion-rate"));
        const conversion_rate = response.data.conversion_rate;
        setConversionRate(conversion_rate.conversion_rate * 0.9);
      } catch (error) {
        toast.error("Failed to fetch conversion rate. Please try again.");
        console.error("Conversion Rate Error:", error);
      }
    }

    fetchConversionRate();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleProceed = async () => {
    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount)) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (withdrawalAmount < withdrawalLimit) {
      toast.error(`Minimum withdrawal amount is $${withdrawalLimit}.`);
      return;
    }

    if (withdrawalAmount > userBalance) {
      toast.error("You cannot withdraw more than your balance.");
      return;
    }

    const requestData = {
      amount: withdrawalAmount,
      type: selectedOption,
      btcAddress: selectedOption === "BTC" ? btcAddress : undefined,
      accountNumber: selectedOption === "Naira" ? accountNumber : "9036577779",
      accountType: selectedOption === "Naira" ? accountType : undefined,
    };

    try {
      const response = await withdrawFunds(
        requestData.amount,
        requestData.btcAddress,
        requestData.accountNumber,
        requestData.accountType
      );
      if (response.success) {
        toast.success(`Withdrawal successful: ${response.message}`);
      } else {
        toast.error(`Withdrawal failed: ${response.message}`);
      }
    } catch (error) {
      toast.error(
        "An error occurred while processing your withdrawal. " + { error }
      );
    }
  };

  useEffect(() => {
    toast.info(
      "Note: Withdrawals are subject to a 15% stamp duty deduction by banks."
    );
  }, []);

  return (
    <>
      <button
        className="flex items-center text-lg text-primary mb-4 px-3 py-4 md:hidden z-50"
        onClick={() => navigate(-1) || navigate("/home")}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>

      <div className="min-h-screen bg-mainBG flex items-center justify-center px-4 py-8">
        <ToastContainer />
        <div className="absolute top-1 lg:top-4 left-4 z-10">
          <img src={logo} alt="Logo" className="h-34" />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Withdraw Funds
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Balance:{" "}
            <span className="text-secondary font-bold">
              ${userBalance.toFixed(2)}
            </span>
          </p>
          <p className="text-center text-gray-600 mb-4">
            Current Conversion Rate:{" "}
            <span className="font-bold">1 USD = ₦{conversionRate}</span>
          </p>
          <div className="flex justify-around mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedOption === "BTC"
                  ? "bg-secondary text-white"
                  : "bg-bgColor hover:bg-secondary"
              }`}
              onClick={() => setSelectedOption("BTC")}
            >
              Withdraw BTC
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedOption === "Naira"
                  ? "bg-secondary text-white"
                  : "bg-bgColor hover:bg-secondary"
              }`}
              onClick={() => setSelectedOption("Naira")}
            >
              Withdraw Naira
            </button>
          </div>
          {selectedOption && (
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-2"
              >
                Enter Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder={`Minimum: $${withdrawalLimit}`}
                className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
              />
            </div>
          )}
          {selectedOption === "BTC" && (
            <div>
              <label
                htmlFor="btcAddress"
                className="block text-sm font-medium mt-4 mb-2"
              >
                Enter BTC Address
              </label>
              <input
                type="text"
                id="btcAddress"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
              />
            </div>
          )}
          {selectedOption === "Naira" && (
            <div>
              <label
                htmlFor="accountType"
                className="block text-sm font-medium mt-4 mb-2"
              >
                Select Account Type
              </label>
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
              >
                <option value="Opay">Opay</option>
                <option value="Palmpay">Palmpay</option>
              </select>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium mt-4 mb-2"
              >
                Enter {accountType} Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g., 1234567890"
                className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
              />
            </div>
          )}
          {selectedOption && (
            <button
              className="w-full mt-6 bg-bgColor text-white py-2 rounded-lg hover:bg-secondary"
              onClick={handleProceed}
            >
              Proceed
            </button>
          )}
          {!selectedOption && (
            <p className="text-center text-gray-600 mt-4">
              Please select an option to proceed.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Withdraw;
