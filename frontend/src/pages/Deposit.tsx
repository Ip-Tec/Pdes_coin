import API, { apiUrl, getDepositAccountDetail } from "../services/api";
import logo from "../assets/pdes.png";
import { useState, useEffect } from "react";
import { AccountDetail, DepositType } from "../utils/type";
import { FaArrowLeft } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { formattedMoneyNGN } from "../utils/helpers";

function Deposit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [depositType, setDepositType] = useState<"Naira" | "Crypto" | "">("");
  const [conversionRate, setConversionRate] = useState<number>(2000);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [accountDetails, setAccountDetails] = useState<DepositType>();
  const [cryptoAddress, setCryptoAddress] = useState<AccountDetail[]>([]);
  const [transactionId, setTransactionId] = useState<string>("");

  // Fetch conversion rate from API
  useEffect(() => {
    async function fetchConversionRate() {
      try {
        const response = await API.get(apiUrl("/transactions/conversion-rate"));
        // console.log("Conversion Rate Response:", response.data);
        const conversion_rate = response.data.conversion_rate;
        setConversionRate(conversion_rate.conversion_rate);
      } catch (error) {
        toast.error("Failed to fetch conversion rate. Please try again.");
        console.error("Conversion Rate Error:", error);
      }
    }

    // if (!user) {
    //   navigate("/login");
    // }

    fetchConversionRate();
  }, []);

  // Fetch account details for Naira deposits
  const fetchAccountDetails = async () => {
    const response = await getDepositAccountDetail();
    // console.log(response);

    setAccountDetails(response);
    sessionStorage.setItem("accountDetails", JSON.stringify(response));
  };

  // Fetch crypto address
  const fetchCryptoAddress = async (crypto: string) => {
    try {
      const response = await API.get(
        apiUrl(`/account/get-crypto-address?crypto=${crypto}`)
      );
      // console.log({ response });

      const address = response.data;
      setCryptoAddress([address]);
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
      if (!transactionId.trim()) {
        toast.error("Please enter the transaction ID/Session ID.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to make a deposit.");
        return;
      }

      if (!accountDetails) {
        setAccountDetails(
          JSON.parse(sessionStorage.getItem("accountDetails") || "{}").id
        );
        if (!accountDetails) {
          return;
        }
        return;
      }

      try {
        await API.post(apiUrl("/transactions/naira-deposit"), {
          amount: selectedAmount,
          transactionId,
          user_id: user.id,
          admin_id: accountDetails.id,
          currency: "naira",
          transaction_id: transactionId,
          deposit_method: "bank transfer",
        });
        toast.success("Naira deposit recorded successfully.");
      } catch (error) {
        toast.error("Failed to record deposit. Please try again.");
        console.error("Deposit Error:", error);
      }
    } else if (depositType === "Crypto" && selectedCrypto && cryptoAmount) {
      if (!transactionId.trim()) {
        toast.error("Please enter the transaction ID/Session ID.");
        return;
      }

      try {
        await API.post(apiUrl("/transactions/crypto-deposit"), {
          crypto: selectedCrypto,
          amount: cryptoAmount,
          transactionId,
        });
        toast.success("Crypto deposit recorded successfully.");
        navigate("/home");
      } catch (error) {
        toast.error("Failed to record deposit. Please try again.");
        console.error("Deposit Error:", error);
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

      <div className="h-screen bg-mainBG text-gray-700 overflow-y-auto flex items-center mb-0 justify-center px-4 py-8">
        <ToastContainer />
        <div className="absolute top-4 left-4 z-10">
          <img src={logo} alt="Logo" className="h-34" />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
          <h1 className="text-2xl font-bold mb-4 text-center">Deposit Funds</h1>
          <p className="text-center text-gray-600 mb-4">
            Current Conversion Rate:{" "}
            <span className="font-bold">
              1 USD = {formattedMoneyNGN(conversionRate)}
            </span>
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

          {/* Updated Deposit Naira Section */}
          {depositType === "Naira" && (
            <div>
              <h2 className="text-lg font-medium mb-4">Select Amount</h2>
              <div className="grid grid-cols-3 gap-4">
                {accountDetails &&
                  accountDetails.max_deposit_amount &&
                  [
                    5000, 10000, 20000, 30000, 50000, 70000, 100000, 300000,
                    500000,
                  ]
                    .filter(
                      (amount) => amount <= accountDetails.max_deposit_amount
                    )
                    .map((amount) => (
                      <button
                        key={amount}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedAmount === amount
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                        }`}
                        onClick={() => setSelectedAmount(amount)}
                      >
                        {formattedMoneyNGN(amount)}
                      </button>
                    ))}
              </div>

              {/* Display Account Details */}
              {accountDetails ? (
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Bank Details:</h3>
                  <p className="text-sm">
                    <span className="font-medium">Bank Name:</span>{" "}
                    {accountDetails.bank_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Account Number:</span>{" "}
                    {accountDetails.account_number}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Account Name:</span>{" "}
                    {accountDetails.account_name}
                  </p>
                  <p
                    className="p-2 bg-secondary text-gray-50 m-2"
                    aria-label="transactionId"
                  >
                    After successfully transfer/deposit copy and pasit the
                    Transaction ID/Session ID below
                  </p>

                  {/* an arrow pointing down to the */}
                </div>
              ) : (
                <p className="mt-4 text-red-500">
                  Unable to fetch account details. Please try again.
                </p>
              )}
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
                      {/* Display the public address */}
                      {cryptoAddress.map((cryptoAddress, index) => (
                        <p key={index} className="text-sm">
                          BTC: {cryptoAddress.BTC}
                          <br /> ETH: {cryptoAddress.ETH} <br />
                          BCH: {cryptoAddress.BTC}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {(selectedAmount || cryptoAmount) && (
            <div className="mt-6">
              <label
                htmlFor="transactionId"
                className="block text-sm font-medium mb-2"
              >
                Enter Transaction ID/Session ID
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Transaction ID/Session ID"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor bg-transparent"
              />
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
