import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buySellPdes, fetchCurrentPrice } from "../services/api";

import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import { FaArrowLeft } from "react-icons/fa";
import { formattedMoneyUSD } from "../utils/helpers";
import { toast, ToastContainer } from "react-toastify";
import LiveChart from "../components/LiveChart";
import CandleStickChart from "../components/CandleStickChart";
import { TradePrice } from "../utils/type";

function BuySellCoin() {
  const { isAuth, user, setUser, tradePrice } = useAuth();
  const [price, setPrice] = useState<TradePrice | undefined>();
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(true);
  const [conversionMessage, setConversionMessage] = useState<string>(""); // Automatic conversion message
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [useUsd, setUseUsd] = useState(true); // For toggling between USD and PDES
  const navigate = useNavigate();

  // Redirect if not authenticated.
  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  // Fetch the coin price from tradePrice provided by AuthContext.
  useEffect(() => {
    const fetchCoinPrice = async () => {
      try {
        // tradePrice might be a promise or value from context.
        const coinPrice = await fetchCurrentPrice();
        console.log({ coinPrice });
        setPrice(coinPrice);
      } catch (error) {
        console.error("Error fetching coin price:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinPrice();
  }, [tradePrice]);

  // Update the amount state when the user types.
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleActionChange = (action: "buy" | "sell") => {
    setAction(action);
  };

  const handleUsdToggle = () => {
    setUseUsd(!useUsd);
  };



  // Update the conversion message automatically.
  useEffect(() => {
    if (amount && price) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        setConversionMessage("");
        return;
      }
      let message = "";
      if (useUsd) {
        // When the user is entering USD.
        if (action === "buy") {
          // PDES received = USD / pdes_buy_price.
          message = `With $${amount} USD, you will get approximately ${(
            amountValue / price.pdes_buy_price
          ).toFixed(4)} PDES.`;
        } else {
          // For selling, USD is already entered.
          message = `With $${amount} USD, you will sell and receive PDES equivalent to ${(
            amountValue / price.pdes_sell_price
          ).toFixed(4)} PDES.`;
        }
      } else {
        // When the user is entering PDES.
        if (action === "buy") {
          // USD required = PDES * pdes_buy_price.
          message = `You will pay ${formattedMoneyUSD(
            amountValue * price.pdes_buy_price
          )} USD to get ${amount} PDES.`;
        } else {
          // USD received = PDES * pdes_sell_price.
          message = `You will receive ${formattedMoneyUSD(
            amountValue * price.pdes_sell_price
          )} USD for selling ${amount} PDES.`;
        }
      }
      setConversionMessage(message);
    } else {
      setConversionMessage("");
    }
  }, [amount, price, useUsd, action]);

  // Handle form submission.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountValue = parseFloat(amount);

    if (amountValue > 0 && price) {
      let finalAmountUSD = 0;
      // If the user is entering USD, send that value directly.
      if (useUsd) {
        finalAmountUSD = amountValue;
      } else {
        // Otherwise, convert PDES to USD.
        finalAmountUSD =
          action === "buy"
            ? amountValue * price.pdes_buy_price
            : amountValue * price.pdes_sell_price;
      }
      console.log({ action, finalAmountUSD, price });

      // Send the USD amount to the API.
      const response = await buySellPdes(action, finalAmountUSD, price);
      if (response) {
        setUser(response.user);
        toast.success(
          `Successfully ${action} ${formattedMoneyUSD(
            finalAmountUSD
          )} worth of Pdes`
        );
      } else {
        toast.error(`Failed to ${action} Pdes`);
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  const handleChartTypeChange = () => {
    setChartType(chartType === "line" ? "candlestick" : "line");
  };

  if (isLoading) {
    return <div className="text-center">Loading coin price...</div>;
  }

  return (
    <div className="min-h-screen md:mb-32 bg-mainBG text-neutral-600 p-4 overflow-y-auto">
      <ToastContainer />
      <button
        className="flex items-center text-lg text-primary mb-5 px-3 py-4 md:hidden z-20"
        onClick={() => navigate(-1) || navigate("/dashboard")}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-16">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Buy and Sell Pdes Coin
        </h1>

        <div className="flex my-4 overflow-x-auto no-scrollbar flex-row justify-evenly items-center gap-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="text-center flex flex-col items-center border-r border-green-500 pr-6">
            <span className="text-sm font-medium text-gray-700">
              PDES Price:
            </span>
            <span className="text-green-500 text-lg font-semibold">
              {action === "buy"
                ? formattedMoneyUSD(price?.pdes_buy_price || 0)
                : formattedMoneyUSD(price?.pdes_sell_price || 0)}
            </span>
          </div>

          <div className="text-center flex flex-col items-center border-r border-blue-500 pr-6">
            <span className="text-sm font-medium text-gray-700">Balance:</span>
            <span className="text-blue-500 text-lg font-semibold">
              {formattedMoneyUSD(Number(user?.balance))}
            </span>
          </div>

          <div className="text-center flex flex-col items-center border-r border-blue-500 pr-6">
            <span className="text-sm font-medium text-gray-700">
              PDES Balance:
            </span>
            <span className="text-blue-500 text-lg font-semibold">
              {user?.crypto_balance?.toFixed(8)}
            </span>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="text-sm font-medium text-gray-700">
              {action === "buy" ? "Buy at:" : "Sell at:"}
            </span>
            <span
              className={`text-lg font-semibold ${
                action === "buy" ? "text-green-500" : "text-red-500"
              }`}
            >
              {action === "buy"
                ? formattedMoneyUSD(price?.pdes_buy_price || 0)
                : formattedMoneyUSD(price?.pdes_sell_price || 0)}
            </span>
          </div>
        </div>

        {/* Display the conversion message automatically */}
        <div className="text-justify my-4">{conversionMessage}</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <InputField
              required
              name="amount"
              type="number"
              value={amount}
              label={useUsd ? "Amount in USD" : "Amount of PDES"}
              onChange={handleAmountChange}
            />
          </div>

          <div className="flex justify-between gap-4 items-center">
            <button
              type="button"
              onClick={() => handleActionChange("buy")}
              className={`w-1/2 py-2 rounded-lg ${
                action === "buy"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Buy PDES
            </button>

            <button
              type="button"
              onClick={() => handleActionChange("sell")}
              className={`w-1/2 py-2 rounded-lg ${
                action === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Sell PDES
            </button>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className={`w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark ${
                action === "sell" && "bg-red-600 text-white"
              }`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)} PDES
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleUsdToggle}
            className="py-2 px-4 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
          >
            Toggle to {useUsd ? "PDES" : "USD"}
          </button>
        </div>

        <div className="mt-8">
          {chartType === "line" ? (
            <LiveChart />
          ) : (
            <div className="mt-4">
              <CandleStickChart />
            </div>
          )}
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={handleChartTypeChange}
            className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Switch to {chartType === "line" ? "Candlestick" : "Line"} Chart
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuySellCoin;
