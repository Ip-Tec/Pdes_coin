import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { buySellPdes, fetchCurrentPrice } from "../services/api";

import { useAuth } from "../contexts/AuthContext";
import InputField from "../components/InputField";
import { FaArrowLeft } from "react-icons/fa";
import { formattedMoneyUSD } from "../utils/helpers";
import { toast, ToastContainer } from "react-toastify";
// import LiveChart from "../components/LiveChart";
// import CandleStickChart from "../components/CandleStickChart";
import { TradePrice } from "../utils/type";
import Loading from "../components/Loading";
import PriceChart from "../components/PriceChart";

function BuySellCoin() {
  const { isAuth, user, setUser, tradePrice } = useAuth();
  const [price, setPrice] = useState<TradePrice | undefined>();
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [useUsd, setUseUsd] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically set the action based on URL parameters or path.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // If URL contains "?sell" or the pathname includes "sell", set action to sell.
    if (searchParams.has("sell") || location.pathname.toLowerCase().includes("sell")) {
      setAction("sell");
    }
    // Otherwise, if it contains "?buy" or pathname includes "buy", set action to buy.
    else if (searchParams.has("buy") || location.pathname.toLowerCase().includes("buy")) {
      setAction("buy");
    }
  }, [location]);

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
        const coinPrice = await fetchCurrentPrice();
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
        if (action === "buy") {
          message = `With $${amount} USD, you will get approximately ${(
            amountValue / price.pdes_buy_price
          ).toFixed(4)} PDES.`;
        } else {
          message = `With $${amount} USD, you will sell and receive PDES equivalent to ${(
            amountValue / price.pdes_sell_price
          ).toFixed(4)} PDES.`;
        }
      } else {
        if (action === "buy") {
          message = `You will pay ${formattedMoneyUSD(
            amountValue * price.pdes_buy_price
          )} USD to get ${amount} PDES.`;
        } else {
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
    setButtonLoading(true);
    const amountValue = parseFloat(amount);

    try {
      if (amountValue > 0 && price) {
        let finalAmountUSD = 0;
        if (useUsd) {
          finalAmountUSD = amountValue;
        } else {
          finalAmountUSD =
            action === "buy"
              ? amountValue * price.pdes_buy_price
              : amountValue * price.pdes_sell_price;
        }
        // console.log({ action, finalAmountUSD, price });

        const response = await buySellPdes(action, finalAmountUSD, price);
        if (response) {
          setUser(response.user);
          toast.success(
            `Successfully ${action} ${formattedMoneyUSD(
              finalAmountUSD
            )} worth of PDES`
          );
        } else {
          toast.error(`Failed to ${action} PDES`);
        }
      } else {
        toast.error("Please enter a valid amount.");
      }
    } catch (error) {
      toast.error("An error occurred while processing the transaction.");
      console.error("Error in buy/sell:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleChartTypeChange = () => {
    setChartType(chartType === "line" ? "candlestick" : "line");
  };

  if (isLoading) {
    return (
      <div className="text-center flex justify-center items-center text-gray-600">
        Loading coin price...
      </div>
    );
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
          Buy and Sell PDES Coin
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
              disabled={buttonLoading}
              className={`w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark ${
                action === "sell" && "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {buttonLoading ? (
                <div className="flex items-center justify-center">
                  <Loading isLoading={true} />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                action.charAt(0).toUpperCase() + action.slice(1) + " PDES"
              )}
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
          {chartType === "line" && (
            <PriceChart />
            // <LiveChart action={action}/>
          ) 
          // : (
          //   <div className="mt-4">
          //     <PriceChart />
          //   </div>
          // )
          }
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
