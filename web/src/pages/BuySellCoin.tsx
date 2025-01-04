import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fetchCurrentPrice, buySellPdes, getTransactionHistory } from "../services/api"; // Example service to fetch Pdes coin price
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Line, Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function BuySellCoin() {
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy"); // Default action is buy
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line"); // Toggle chart types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [priceHistory, setPriceHistory] = useState<any[]>([]); // To store historical price data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoinPrice = async () => {
      try {
        const coinPrice = await fetchCurrentPrice(); // Fetch the current price of Pdes coin
        setPrice(coinPrice);
      } catch (error) {
        console.error("Error fetching coin price:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPriceHistory = async () => {
      try {
        const history = await getTransactionHistory(); // Fetch the price history of Pdes coin
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
    if (amount && price) {
      const totalAmount = parseFloat(amount) * price;
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)}ing ${amount} Pdes will cost $${totalAmount.toFixed(2)}`);
    }
  };

  const handleChartTypeChange = () => {
    setChartType(chartType === "line" ? "candlestick" : "line");
  };

  if (isLoading) {
    return <div className="text-center">Loading coin price...</div>;
  }

  const data = {
    labels: priceHistory.map((item) => item.date), // Assuming priceHistory contains a 'date' field
    datasets: [
      {
        label: "Pdes Coin Price",
        data: priceHistory.map((item) => item.price), // Assuming priceHistory contains a 'price' field
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const candlestickData = {
    // Here you would set your candlestick chart data (OHLC)
    // For now, using placeholder data as an example
    datasets: [
      {
        label: "Pdes Coin Price",
        data: priceHistory.map((item) => ({
          x: item.date, // Time
          o: item.openPrice, // Open price
          h: item.highPrice, // High price
          l: item.lowPrice, // Low price
          c: item.closePrice, // Close price
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="min-h-screen lg:mb-32 bg-mainBG p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-6">Buy and Sell Pdes Coin</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="text-xl">Current Price: ${price?.toFixed(2)}</div>
          <div className="text-lg">{action === "buy" ? "Buying" : "Selling"} Pdes</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Amount of Pdes</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-3/4 px-4 py-2 border rounded-lg"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleActionChange("buy")}
              className={`w-1/2 py-2 rounded-lg ${action === "buy" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Buy Pdes
            </button>
            <button
              type="button"
              onClick={() => handleActionChange("sell")}
              className={`w-1/2 py-2 rounded-lg ${action === "sell" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
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

        <div className="mt-8 text-center">
          <button
            onClick={handleChartTypeChange}
            className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Switch to {chartType === "line" ? "Candlestick" : "Line"} Chart
          </button>
        </div>

        <div className="mt-8">
          {chartType === "line" ? (
            <Line data={data} />
          ) : (
            // You can integrate a candlestick chart here
            // Placeholder for candlestick chart rendering
            <div>Candlestick chart is under development...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuySellCoin;
