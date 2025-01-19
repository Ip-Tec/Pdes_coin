import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2"; // or Bar for bar chart
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { distributionOverTime } from "../../services/adminAPI";

// Register necessary components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

interface ChartData {
  labels: string[];
  data: number[];
}

const DistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchDistributionData = async () => {
      const distribution = await distributionOverTime();
      setChartData({
        labels: distribution.labels,
        data: distribution.data,
      });
    };
    fetchDistributionData();
  }, []);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  // Prepare chart data
  const data = {
    labels: chartData.labels, // Dates
    datasets: [
      {
        label: "Transaction Amount",
        data: chartData.data, // Transaction sums for each date
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return <Line data={data} />;
};

export default DistributionChart;
