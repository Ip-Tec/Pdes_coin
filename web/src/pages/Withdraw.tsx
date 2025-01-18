import { useEffect, useState } from "react";
import logo from "../assets/pdes.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API, { apiUrl, withdrawFunds } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";

function Withdraw() {
  const { user, isAuth } = useAuth();
  const userBalance = user?.balance || 0;
  const withdrawalLimit = 50;
  const [selectedOption, setSelectedOption] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Opay");
  const [accountName, setAccountName] = useState(user?.full_name || "");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();
  const [conversionRate, setConversionRate] = useState<number>(2000);

  useEffect(() => {
    if (!isAuth || !user) {
      navigate("/login");
    }
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
  }, [isAuth, navigate]);

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
      toast.error(`Minimum withdrawal amount is ${withdrawalLimit}.`);
      return;
    }

    if (withdrawalAmount > userBalance) {
      toast.error("You cannot withdraw more than your balance.");
      return;
    }

    const requestData = {
      amount: withdrawalAmount,
      type: selectedOption,
      accountName: accountName,
      cryptoAddress: selectedOption === "BTC" ? cryptoAddress : undefined,
      accountNumber: selectedOption === "Naira" ? accountNumber : undefined,
      accountType: selectedOption === "Naira" ? accountType : "BTC",
    };

    try {
      const response = await withdrawFunds(requestData);
      if (response.status == 201) {
        const updatedBalance = userBalance - withdrawalAmount;
        if (user) {
          user.balance = updatedBalance;
        }
        setAmount("");
        setSelectedOption("");
        setCryptoAddress("");
        setAccountNumber("");
        setAccountType("Opay");
        setAccountName(user?.full_name || "");
        toast.success(response.data.message);
      } else {
        toast.error(`Withdrawal failed: ${response.data.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while processing your withdrawal.");
      console.error("Withdrawal Error:", error);
    }
  };  useEffect(() => {
    toast.info(
      "Note: Withdrawals are subject to a 15% stamp duty deduction by banks."
    );
  }, []);

  return (
    <>
      <button
        className="flex items-center text-lg text-primary mb-5 px-3 py-4 md:hidden z-20"
        onClick={() => navigate(-1) || navigate("/home")}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>

      <div className="min-h-screen bg-mainBG flex items-center justify-center px-4 py-8 md:mb-16">
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
              <InputField
                type="number"
                name="amount"
                value={amount}
                label="Enter Amount"
                onChange={handleAmountChange}
                placeholder={`Minimum: $${withdrawalLimit}`}
              />
            </div>
          )}
          {selectedOption === "BTC" && (
            <InputField
              label="Enter BTC Address"
              name="cryptoAddress"
              type="text"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
            />
          )}
          {selectedOption === "Naira" && (
            <>
              <label
                htmlFor="accountType"
                className="block text-sm font-medium mt-4 mb-2 text-gray-800"
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
                <option value="Access Bank">Access Bank</option>
              </select>

              <InputField
                label="Account Name"
                name="accountName"
                type="text"
                value={accountName}
                disabled
                onChange={(e) => setAccountName(e.target.value)}
              />
              <InputField
                label={`Enter ${accountType} Account Number`}
                name="accountNumber"
                type="number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g., 1234567890"
              />
            </>
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
