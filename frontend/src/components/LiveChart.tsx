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
import { PriceData } from "../utils/type";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LiveChartProps {
  action?: "buy" | "sell"; // Determines which dataset to display
}
interface TooltipItem {
  label: string;
}

const LiveChart: React.FC<LiveChartProps> = ({ action = "buy" }) => {
  // Get the transactions data from AuthContext (which is updated via your WebSocket)
  const { trade } = useAuth();
  // console.log({ transactions });

  // Map transactions to the PriceData shape.
  // Adjust the mapping as needed if your actual data differs.
  const chartDataArray: PriceData[] =
  Array.isArray(trade) && trade.length > 0
    ? trade.map((txn) => ({
          // Use the transaction's created_at as the time.
          // If created_at might be undefined, you can provide a fallback (like an empty string).
          time: txn.created_at || "Unknown",
          // If the transaction type is "buy", set buy to the amount; otherwise, 0.
          buy: txn.transaction_type.toLowerCase() === "buy" ? txn.amount : 0,
          // If the transaction type is "sell", set sell to the amount; otherwise, 0.
          sell: txn.transaction_type.toLowerCase() === "sell" ? txn.amount : 0,
        }))
      : [
          // Fallback default data if there are no transactions.
          { time: "2023-01-01", buy: 10, sell: 15 },
          { time: "2023-01-02", buy: 12, sell: 20 },
          { time: "2023-01-03", buy: 8, sell: 18 },
        ];

  // Build the dataset based on the action prop.
  const datasets = [];
  if (action === "buy") {
    datasets.push({
      label: "Buy",
      data: chartDataArray.map((entry) => entry.buy),
      borderColor: "green",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
      fill: false,
      tension: 0.1,
    });
  } else if (action === "sell") {
    datasets.push({
      label: "Sell",
      data: chartDataArray.map((entry) => entry.sell),
      borderColor: "red",
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      fill: false,
      tension: 0.1,
    });
  }

  const chartData = {
    labels: chartDataArray.map((entry) => entry.time),
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Buy and Sell Prices Over Time",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem[]) => tooltipItems[0].label,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LiveChart;
