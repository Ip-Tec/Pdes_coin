import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTradeHistory } from '../services/api';
import { PriceData } from '../utils/type';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';

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
      time: '2023-01-01',
      buy: 10,
      sell: 15,
    },
    {
      time: '2023-01-02',
      buy: 12,
      sell: 20,
    },
    {
      time: '2023-01-03',
      buy: 8,
      sell: 18,
    },
    // Add more data entries
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTradeHistory();
        console.log({ response });
        console.log(response.price_trend);
        
        await setData(response.price_trend);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Format the data for the candlestick chart
  const chartData = {
    labels: data.map((entry) => entry.time),
    datasets: [
      {
        label: 'Candlestick Chart',
        data: data.map((entry) => ({
          x: entry.time,
          o: entry.buy,  // Open price
          h: Math.max(entry.buy, entry.sell),  // High price (max of buy and sell)
          l: Math.min(entry.buy, entry.sell),  // Low price (min of buy and sell)
          c: entry.sell,  // Close price
        })),
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
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
        text: 'Candlestick Chart',
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
        type: 'category', // Corrected to match Chart.js expected scale type
        title: {
          display: true,
          text: 'Date', // Label for the x-axis
        },
      },
      y: {
        type: 'linear', // Ensure this type is specified
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
  };
  

  return <Line data={chartData} options={options} />;
};

export default CandleStickChart;
