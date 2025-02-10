import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getTradeHistory } from "../services/api";
import { PriceData } from "../utils/type";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";

// Register required components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

const CandleStickChart = () => {
  const [data, setData] = useState<PriceData[]>([
    {
      time: "2023-01-01",
      buy: 10,
      sell: 15,
    },
    {
      time: "2023-01-02",
      buy: 12,
      sell: 20,
    },
    {
      time: "2023-01-03",
      buy: 8,
      sell: 18,
    },
    // Add more data entries if needed
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTradeHistory();
        console.log({ response });
        console.log(response.price_trend);
        setData(response.price_trend);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Format the data for the candlestick chart
  const chartData = {
    // When using a timeseries scale, labels are typically provided via the data points
    // so you can omit the separate labels array.
    datasets: [
      {
        label: "Candlestick Chart",
        data: data.map((entry) => ({
          x: entry.time, // Must be in a recognized date format (ISO string or Date object)
          o: entry.buy, // Open price
          h: Math.max(entry.buy, entry.sell), // High price
          l: Math.min(entry.buy, entry.sell), // Low price
          c: entry.sell, // Close price
        })),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: false,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Candlestick Chart",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItem: { label: string }[]) => {
            return tooltipItem[0].label;
          },
        },
      },
    },
    scales: {
      x: {
        type: "timeseries" as const,
        time: {
          unit: "day" as const,
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        type: "linear" as const,
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default CandleStickChart;
