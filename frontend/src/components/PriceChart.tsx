import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { ChartData } from "chart.js";
import API, { url } from "../services/api";

interface PriceHistoryItem {
  timestamp: string | number | Date;
  close_price: number;
}

interface PriceChartProps {
  showTimestamp?: boolean; // Prop to control timestamp visibility
}

const PriceChart: React.FC<PriceChartProps> = ({ showTimestamp = false }) => {
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get<PriceHistoryItem[]>(url + "/transactions/price-history")
      .then((response) => {
        const data = response.data;

        // If timestamps should be shown, format them; otherwise, use empty labels
        const timestamps = showTimestamp
          ? data.map((item) => new Date(item.timestamp).toLocaleString())
          : data.map(() => ""); // Hide timestamps

        const labelTexts = showTimestamp
          ? "Close Price"
          : "";

        const closePrices = data.map((item) => item.close_price);

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: labelTexts,
              data: closePrices,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              fill: true,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching price history:", error);
        setError("Failed to fetch price data. Please try again later.");
      });
  }, [showTimestamp]);

  if (error) return <p>{error}</p>;
  if (!chartData) return <p>Loading...</p>;

  return (
    <div className="text-gray-600 bg-white w-full">
      <h2>PDES Trading Chart</h2>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default PriceChart;
