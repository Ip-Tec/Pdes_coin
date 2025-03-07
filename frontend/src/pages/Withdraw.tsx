import { useEffect, useState } from "react";
import logo from "../assets/pdes.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import API, { apiUrl, withdrawFunds, withdrawReward } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import { formattedMoneyNGN, formattedMoneyUSD } from "../utils/helpers";

function Withdraw() {
  const { user, isAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're on the reward route
  const isRewardRoute = location.pathname === "/withdraw/reward";
  
  // Set initial withdrawal type based on the route
  const [withdrawalType, setWithdrawalType] = useState<"balance" | "reward">(
    isRewardRoute ? "reward" : "balance"
  );
  
  // Get the appropriate balance based on withdrawal type
  const userBalance = withdrawalType === "balance" 
    ? user?.balance || 0 
    : user?.referral_reward || 0;
    
  const withdrawalLimit = 5;
  const [selectedOption, setSelectedOption] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Opay");
  const [accountName, setAccountName] = useState(user?.full_name || "");
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState<number>(2000);

  useEffect(() => {
    if (!isAuth || !user) {
      navigate("/login");
    }
    async function fetchConversionRate() {
      try {
        const response = await API.get(apiUrl("/transactions/conversion-rate"));
        const conversion_rate = response.data.conversion_rate;
        setConversionRate(conversion_rate.conversion_rate);
      } catch (error) {
        toast.error("Failed to fetch conversion rate. Please try again.");
        console.error("Conversion Rate Error:", error);
      }
    }

    fetchConversionRate();
  }, [isAuth, navigate]);

  // Reset amount field when switching withdrawal types
  useEffect(() => {
    setAmount("");
  }, [withdrawalType]);

  // Reset to the normal withdraw page if withdrawal type changes from reward
  useEffect(() => {
    if (!isRewardRoute && withdrawalType === "reward") {
      // This is for when user manually toggles from reward to balance
      navigate("/withdraw");
    }
  }, [withdrawalType, navigate, isRewardRoute]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip out any non-numeric characters before formatting
    const rawValue = e.target.value.replace(/[^\d.]/g, "");
    // Format the raw value using formattedMoneyNGN function
    const formattedValue = formattedMoneyUSD(Number(rawValue));
    // Set the amount to the formatted value
    setAmount(formattedValue);
  };

  const handleProceed = async () => {
    // For reward withdrawals, we withdraw the entire reward amount
    const withdrawalAmount = withdrawalType === "reward" 
      ? userBalance 
      : parseFloat(amount.replace(/[^\d.]/g, ""));

    if (withdrawalType === "balance") {
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
    }

    const requestData = {
      accountName: accountName,
      cryptoAddress: selectedOption === "BTC" ? cryptoAddress : undefined,
      accountNumber: selectedOption === "Naira" ? accountNumber : undefined,
      accountType: selectedOption === "Naira" ? accountType : "BTC",
    };

    try {
      let response;
      
      if (withdrawalType === "reward") {
        // Add the required properties to match AccountDetails type
        response = await withdrawReward({
          ...requestData,
          amount: userBalance, // Include the reward balance amount
          type: selectedOption  // Include the selected option as type
        });
      } else {
        response = await withdrawFunds({
          ...requestData,
          amount: withdrawalAmount,
          type: selectedOption,
        });
      }

      if (response.status == 201) {
        if (user) {
          if (withdrawalType === "reward") {
            user.referral_reward = 0; // Set reward balance to 0 after withdrawal
          } else {
            user.balance = user.balance - withdrawalAmount;
          }
        }
        
        // Reset form
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
  };

  useEffect(() => {
    toast.info("Note: Withdrawals are subject to a 15% stamp duty deduction.");
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

      <div className="min-h-screen bg-mainBG flex items-center justify-center px-4 py-8 mb-10 md:mb-16">
        <ToastContainer />
        <div className="absolute top-1 lg:top-4 left-4 z-10">
          <img src={logo} alt="Logo" className="h-34" />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Withdraw Funds
          </h1>
          
          {/* Add withdrawal type toggle */}
          <div className="mb-4">
            <div className="flex justify-center space-x-4 mb-2">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  withdrawalType === "balance"
                    ? "bg-secondary text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setWithdrawalType("balance")}
              >
                Main Balance
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  withdrawalType === "reward"
                    ? "bg-secondary text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setWithdrawalType("reward")}
              >
                Reward Balance
              </button>
            </div>
          </div>
          
          <p className="text-center text-gray-600 mb-4">
            {withdrawalType === "reward" ? "Reward Balance: " : "Balance: "}
            <span className="text-secondary font-bold">
              {formattedMoneyUSD(userBalance)}
            </span>
          </p>

          <p className="text-center text-gray-600 mb-4">
            Current Conversion Rate:{" "}
            <span className="font-bold">
              1 USD = {formattedMoneyNGN(conversionRate)}
            </span>
          </p>
          
          {/* Display message for reward withdrawals */}
          {withdrawalType === "reward" && userBalance > 0 && (
            <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg mb-4 text-center">
              You are withdrawing your entire reward balance: {formattedMoneyUSD(userBalance)}
            </div>
          )}
          
          {/* Show warning if reward balance is 0 */}
          {withdrawalType === "reward" && userBalance <= 0 && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 p-3 rounded-lg mb-4 text-center">
              You don't have any rewards to withdraw.
            </div>
          )}
          
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
          
          {/* Only show amount field for balance withdrawals */}
          {withdrawalType === "balance" && selectedOption && (
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
                <option value="UBA">UBA</option>
                <option value="Opay">Opay</option>
                <option value="Palmpay">Palmpay</option>
                <option value="MoniePoint">Monie Point</option>
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
          
          {/* Only enable the button if proper conditions are met */}
          {selectedOption && (
            <button
              className={`w-full mt-6 py-2 rounded-lg ${
                (withdrawalType === "reward" && userBalance <= 0)
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-bgColor hover:bg-secondary text-white"
              }`}
              onClick={handleProceed}
              disabled={withdrawalType === "reward" && userBalance <= 0}
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
