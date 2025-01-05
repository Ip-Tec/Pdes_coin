import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/pdes.png";
import { DepositType } from "../utils/type";

function Deposit() {
  const [depositType, setDepositType] = useState<"Naira" | "Crypto" | "">("");
  const [conversionRate, setConversionRate] = useState<number>(1800);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [accountDetails, setAccountDetails] = useState<DepositType>();
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);

  // Fetch conversion rate from API
  useEffect(() => {
    async function fetchConversionRate() {
      try {
        const response = await fetch(
          "https://your-api-endpoint/conversion-rate"
        );
        const data = await response.json();
        setConversionRate(data.rate); // Set conversion rate
      } catch (error) {
        toast.error("Failed to fetch conversion rate. Please try again.");
        console.error(error);
      }
    }

    fetchConversionRate();
  }, []);

  // Fetch account details for Naira
  const fetchAccountDetails = async () => {
    try {
      const response = await fetch("https://your-api-endpoint/account-details");
      const { data } = await response.json();
      setAccountDetails(data);
    } catch (error) {
      toast.error("Failed to fetch account details. Please try again.");
      console.error(error);
    }
  };

  // Fetch crypto address
  const fetchCryptoAddress = async (crypto: string) => {
    try {
      const response = await fetch(
        `https://your-api-endpoint/crypto-address?crypto=${crypto}`
      );
      const data = await response.json();
      setCryptoAddress(data.address);
    } catch (error) {
      toast.error("Failed to fetch crypto address. Please try again.");
      console.error(error);
    }
  };

  const handleCryptoSelection = (crypto: string) => {
    setSelectedCrypto(crypto);
    fetchCryptoAddress(crypto); // Fetch the public address
  };

  const handleProceed = async () => {
    if (depositType === "Naira" && selectedAmount) {
      toast.info(`Please pay ₦${selectedAmount} to the following account.`);
      if (accountDetails) {
        toast.success(
          `Bank: ${accountDetails.bank}\nAccount Name: ${accountDetails.accountName}\nAccount Number: ${accountDetails.accountNumber}`
        );
      }
    } else if (depositType === "Crypto" && selectedCrypto && cryptoAmount) {
      toast.info(`Deposit ${cryptoAmount} ${selectedCrypto} to the address.`);
      if (cryptoAddress) {
        toast.success(`Public Address: ${cryptoAddress}`);
      }
    } else {
      toast.error("Please complete all fields.");
    }
  };

  return (
    <div className="min-h-screen bg-mainBG text-gray-700 flex items-center justify-center px-4 py-8">
      <ToastContainer />
      {/* Logo */}
      <div className="absolute top-4 left-4 z-10">
        <img src={logo} alt="Logo" className="h-34" />
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
        <h1 className="text-2xl font-bold mb-4 text-center">Deposit Funds</h1>

        {/* Conversion Rate */}
        <p className="text-center text-gray-600 mb-4">
          Current Conversion Rate:{" "}
          <span className="font-bold">1 USD = ₦{conversionRate}</span>
        </p>

        {/* Selection Buttons */}
        <div className="flex justify-around mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              depositType === "Naira"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
            onClick={() => {
              setDepositType("Naira");
              fetchAccountDetails(); // Fetch account details when Naira is selected
            }}
          >
            Deposit Naira
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              depositType === "Crypto"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
            onClick={() => setDepositType("Crypto")}
          >
            Deposit Crypto
          </button>
        </div>

        {/* Naira Deposit */}
        {depositType === "Naira" && (
          <div>
            <h2 className="text-lg font-medium mb-4">Select Amount</h2>
            <div className="grid grid-cols-3 gap-4">
              {[5000, 10000, 20000, 50000, 100000, 500000].map((amount) => (
                <button
                  key={amount}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedAmount === amount
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ₦{amount.toLocaleString()}
                </button>
              ))}
            </div>
            {accountDetails && (
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Account Details:</h3>
                <p>Bank: {accountDetails.bank}</p>
                <p>Account Name: {accountDetails.accountName}</p>
                <p>Account Number: {accountDetails.accountNumber}</p>
              </div>
            )}
          </div>
        )}

        {/* Crypto Deposit */}
        {depositType === "Crypto" && (
          <div>
            <h2 className="text-lg font-medium mb-4">Select Cryptocurrency</h2>
            <div className="grid grid-cols-2 gap-4">
              {["BTC", "USDC", "LTC", "ETH"].map((crypto) => (
                <button
                  key={crypto}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedCrypto === crypto
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                  }`}
                  onClick={() => handleCryptoSelection(crypto)}
                >
                  {crypto}
                </button>
              ))}
            </div>
            {selectedCrypto && (
              <div className="mt-6">
                <label
                  htmlFor="cryptoAmount"
                  className="block text-sm font-medium mb-2"
                >
                  Enter Amount (in {selectedCrypto})
                </label>
                <input
                  type="number"
                  id="cryptoAmount"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  placeholder={`Enter amount in ${selectedCrypto}`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor bg-transparent"
                />
                {cryptoAddress && (
                  <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Public Address:</h3>
                    <p className="text-sm break-words">{cryptoAddress}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Proceed Button */}
        {depositType && (
          <button
            className="w-full mt-6 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            onClick={handleProceed}
          >
            Proceed
          </button>
        )}

        {!depositType && (
          <p className="text-center text-gray-600 mt-4">
            Please select a deposit type to proceed.
          </p>
        )}
      </div>
    </div>
  );
}

export default Deposit;
