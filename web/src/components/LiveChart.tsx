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
import { useEffect, useState } from "react";
import { PriceData } from "../utils/type";
import { getTradeHistory } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LiveChart = () => {
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
    // Add more data entries
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTradeHistory();
        // console.log({ response });
        // console.log(response.price_trend);

        await setData(response.price_trend);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.map((entry) => entry.time),
    datasets: [
      {
        label: "Buy",
        data: data.map((entry) => entry.buy),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Sell",
        data: data.map((entry) => entry.sell),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
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
          title: (tooltipItem: { label: string }[]) => {
            return tooltipItem[0].label;
          },
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
