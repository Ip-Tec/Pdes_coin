import API, { apiUrl } from "../services/api";
import logo from "../assets/pdes.png";
import { useState, useEffect } from "react";
import { DepositType } from "../utils/type";
import { FaArrowLeft } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function Deposit() {
  const navigate = useNavigate();
  const [depositType, setDepositType] = useState<"Naira" | "Crypto" | "">("");
  const [conversionRate, setConversionRate] = useState<number>(2000);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [accountDetails, setAccountDetails] = useState<DepositType>();
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);

  // Fetch conversion rate from API
  useEffect(() => {
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
  }, []);

  // Fetch account details for Naira deposits
  const fetchAccountDetails = async () => {
    try {
      const response = await API.get(apiUrl("/account-details"));
      setAccountDetails(response.data);
    } catch (error) {
      toast.error("Failed to fetch account details. Please try again.");
      console.error("Account Details Error:", error);
    }
  };

  // Fetch crypto address
  const fetchCryptoAddress = async (crypto: string) => {
    try {
      const response = await API.get(
        apiUrl(`/crypto-address?crypto=${crypto}`)
      );
      const { address } = response.data;
      setCryptoAddress(address);
    } catch (error) {
      toast.error("Failed to fetch crypto address. Please try again.");
      console.error("Crypto Address Error:", error);
    }
  };

  // Handle cryptocurrency selection
  const handleCryptoSelection = (crypto: string) => {
    setSelectedCrypto(crypto);
    fetchCryptoAddress(crypto);
  };

  // Handle proceed action
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
    <>
      <button
        className="flex items-center text-primary mb-4 px-2 py-4 z-50 md:hidden"
        onClick={() => navigate(-1) || navigate("/home")}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>

      <div className="min-h-screen bg-mainBG text-gray-700 flex items-center justify-center px-4 py-8">
        <ToastContainer />
        <div className="absolute top-4 left-4 z-10">
          <img src={logo} alt="Logo" className="h-34" />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
          <h1 className="text-2xl font-bold mb-4 text-center">Deposit Funds</h1>

          <p className="text-center text-gray-600 mb-4">
            Current Conversion Rate:{" "}
            <span className="font-bold">1 USD = ₦{conversionRate}</span>
          </p>

          <div className="flex justify-around mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                depositType === "Naira"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => {
                setDepositType("Naira");
                fetchAccountDetails();
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
            </div>
          )}

          {depositType === "Crypto" && (
            <div>
              <h2 className="text-lg font-medium mb-4">
                Select Cryptocurrency
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {["BTC", "BCH", "ETH"].map((crypto) => (
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
    </>
  );
}

export default Deposit;
