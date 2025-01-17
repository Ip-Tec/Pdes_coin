import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentPrice, getTransactionHistory } from "../services/api";
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
  const { isAuth } = useAuth();
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [priceHistory, setPriceHistory] = useState<CryptoHistory[]>([]);
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
        console.log("coinPrice", coinPrice);
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
        console.log("history", history);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountValue = parseFloat(amount);
    if (amountValue > 0 && price) {
      const totalAmount = amountValue * price;
      alert(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        }ing ${amount} Pdes will cost ${totalAmount.toFixed(2)}`
      );
    } else {
      alert("Please enter a valid amount.");
    }
  };

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

        <div className="mt-8">
          {chartType === "line" ? (
            <Line data={data} />
          ) : (
            <>
              <p className="text-center text-neutral-700">
                Candlestick is coming soon
              </p>
              <div className="mt-4 hidden">
                <CandlestickChart data={candlestickData} />
              </div>
            </>
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

        <div className="flex justify-between items-center mt-8">
          <div className="text-xl">Current Price: ${price?.toFixed(2)}</div>
          <div className="text-lg">
            {action === "buy" ? "Buying" : "Selling"} Pdes
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <InputField
              required
              name="amount"
              type="number"
              value={amount}
              label="Amount of Pdes"
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
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              {action.charAt(0).toUpperCase() + action.slice(1)} Pdes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default BuySellCoin;
