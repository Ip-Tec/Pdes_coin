import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2"; // or Doughnut for a doughnut chart
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { getProportionChart } from "../../services/adminAPI";

// Register necessary components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

interface ProportionChartProps {
  type: "transaction_type" | "currency";
}

interface ChartData {
  labels: string[];
  data: number[];
}

const ProportionChart: React.FC<ProportionChartProps> = ({ type }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchProportionData = async () => {
      const proportion = await getProportionChart(type);
      setChartData({
        labels: proportion.labels,
        data: proportion.data,
      });
    };
    fetchProportionData();
  }, [type]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  // Prepare chart data
  const data = {
    labels: chartData.labels, // Transaction types or currencies
    datasets: [
      {
        label: `Proportions by ${chartData.labels}`,
        data: chartData.data, // Proportions
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
        ],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40"],
        borderWidth: 1,
      },
    ],
  };

  return <Pie className="md:w-2/3" data={data} />;
};

export default ProportionChart;
