import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  buySellPdes,
  fetchCurrentPrice,
  getTransactionHistory,
} from "../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../contexts/AuthContext";
import { CryptoHistory } from "../utils/type";
import InputField from "../components/InputField";
import CandlestickChart from "../components/CandlestickChart";
import { FaArrowLeft } from "react-icons/fa";
import { formattedMoneyUSD } from "../utils/helpers";
import { toast, ToastContainer } from "react-toastify";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function BuySellCoin() {
  const { isAuth, user, setUser } = useAuth();
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [priceHistory, setPriceHistory] = useState<CryptoHistory[]>([]);
  const [useUsd, setUseUsd] = useState(true); // For toggling between USD and Pdes
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

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

    const fetchPriceHistory = async () => {
      try {
        const history = await getTransactionHistory();
        setPriceHistory(history);
      } catch (error) {
        console.error("Error fetching price history:", error);
      }
    };

    fetchCoinPrice();
    fetchPriceHistory();
  }, []);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleActionChange = (action: "buy" | "sell") => {
    setAction(action);
  };

  const handleUsdToggle = () => {
    setUseUsd(!useUsd);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountValue = parseFloat(amount);

    if (amountValue > 0 && price) {
      const finalAmountInUSD = useUsd
        ? amountValue
        : action === "buy"
        ? amountValue * price // PDES to USD for buying
        : amountValue / price; // PDES to USD for selling

      // Send finalAmountInUSD to the DB via API
      const response = await buySellPdes(action, finalAmountInUSD, price);
      if (response) {
        setUser(response.user);
        toast.success(
          `Successfully ${action} ${formattedMoneyUSD(
            finalAmountInUSD
          )} worth of Pdes`
        );
      } else {
        toast.error(`Failed to ${action} Pdes`);
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  useEffect(() => {
    if (amount && price) {
      const amountValue = parseFloat(amount);
      const calculatedTotal = useUsd
        ? action === "buy"
          ? (amountValue / price).toFixed(6) // USD to PDES
          : (amountValue * price).toFixed(2) // USD to USD (sell)
        : action === "buy"
        ? (amountValue * price).toFixed(2) // PDES to USD
        : (amountValue / price).toFixed(6); // PDES to PDES (sell)
      setTotal(calculatedTotal);
    } else {
      setTotal("");
    }
  }, [amount, price, useUsd, action]);

  const handleChartTypeChange = () => {
    setChartType(chartType === "line" ? "candlestick" : "line");
  };

  if (isLoading) {
    return <div className="text-center">Loading coin price...</div>;
  }

  const data = {
    labels: priceHistory.map((item) => item.created_at),
    datasets: [
      {
        label: "Pdes Coin Price",
        data: priceHistory.map((item) => item.amount),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  };

  const candlestickData = priceHistory.map((item) => ({
    time: item.created_at.split("T")[0],
    open: item.openPrice ?? 0,
    high: item.highPrice ?? 0,
    low: item.lowPrice ?? 0,
    close: item.closePrice ?? 0,
  }));

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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Buy and Sell Pdes Coin
        </h1>

        <div className="flex my-4 overflow-x-auto no-scrollbar flex-row justify-evenly items-center gap-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="text-center flex flex-col items-center border-r border-green-500 pr-6">
            <span className="text-sm font-medium text-gray-700">
              PDES Price:
            </span>
            <span className="text-green-500 text-lg font-semibold">
              {formattedMoneyUSD(Number(price))}
            </span>
          </div>

          <div className="text-center flex flex-col items-center border-r border-blue-500 pr-6">
            <span className="text-sm font-medium text-gray-700">Balance:</span>
            <span className="text-blue-500 text-lg font-semibold">
              {formattedMoneyUSD(Number(user?.balance))}
            </span>
          </div>
           <div className="text-center flex flex-col items-center border-r border-blue-500 pr-6">
            <span className="text-sm font-medium text-gray-700">PDES Balance:</span>
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
              {formattedMoneyUSD(Number(price))}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-justify my-4">
            {total &&
              (useUsd
                ? action === "buy"
                  ? `You will receive: ${total} PDES`
                  : `You will pay: ${formattedMoneyUSD(parseFloat(total))} USD`
                : action === "buy"
                ? `You will pay: ${formattedMoneyUSD(parseFloat(total))} USD`
                : `You will receive: ${total} PDES`)}
          </div>

          <div className="flex justify-between items-center">
            <InputField
              required
              name="amount"
              type="number"
              value={amount}
              label={useUsd ? "Amount in USD" : "Amount of Pdes"}
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
              Buy Pdes
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
              Sell Pdes
            </button>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className={`w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark" ${
                action === "sell" && "bg-red-600 text-white"
              }`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)} Pdes
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleUsdToggle}
            className="py-2 px-4 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
          >
            Toggle to {useUsd ? "Pdes" : "USD"}
          </button>
        </div>

        <div className="mt-8">
          {chartType === "line" ? (
            <Line data={data} />
          ) : (
            <div className="mt-4 hidden">
              <CandlestickChart data={candlestickData} />
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
