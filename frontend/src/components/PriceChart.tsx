import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import API, { url } from "../services/api";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryItem {
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
}

interface PriceChartProps {
  showTimestamp?: boolean;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
}

const PriceChart: React.FC<Omit<PriceChartProps, 'timeframe'>> = () => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('15m');
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get<PriceHistoryItem[]>(`${url}/transactions/price-history?timeframe=${timeframe}`)
      .then((response) => {
        const data = response.data;

        // Format timestamps for display
        const formattedDates = data.map(item => {
          const date = new Date(item.timestamp);
          return date.toLocaleString();
        });

        setChartData({
          labels: formattedDates,
          datasets: [
            {
              label: 'Price',
              data: data.map(item => item.close_price),
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Volume',
              data: data.map(item => item.volume),
              borderColor: 'rgba(153,102,255,1)',
              backgroundColor: 'rgba(153,102,255,0.2)',
              fill: false,
              yAxisID: 'volume',
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching price history:", error);
        setError("Failed to fetch price data. Please try again later.");
      });
  }, [timeframe]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        position: 'right' as const,
      },
      volume: {
        position: 'left' as const,
        display: true,
      },
    },
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!chartData) return <p>Loading...</p>;

  return (
    <div className="bg-transparent">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">PDES</h2>
        <div className="flex gap-2">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as '1m' | '5m' | '15m' | '1h' | '4h' | '1d')}
              className={`px-2 py-1 rounded ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[600px]">
        <Line key={timeframe} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;
