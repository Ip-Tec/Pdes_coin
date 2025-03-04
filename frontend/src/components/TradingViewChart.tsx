import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, LineData, Time } from 'lightweight-charts';
import API, { url } from "../services/api";

interface PriceHistoryItem {
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
}

const TradingViewChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1mo' | '1y'>('1d');
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('line');

  useEffect(() => {
    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const series = chartType === 'candlestick'
        ? chartRef.current.addCandlestickSeries()
        : chartRef.current.addLineSeries();

      // Fetch data from your API
      API.get<PriceHistoryItem[]>(`${url}/transactions/price-history?timeframe=${timeframe}`)
        .then((response) => {
          const data = response.data.map((item: PriceHistoryItem) => ({
            time: (new Date(item.timestamp).getTime() / 1000) as Time, // Convert to UNIX timestamp
            open: item.open_price,
            high: item.high_price,
            low: item.low_price,
            close: item.close_price,
          }));

          if (chartType === 'candlestick') {
            series.setData(data as CandlestickData[]);
          } else {
            const lineData: LineData[] = data.map(d => ({
              time: d.time,
              value: d.close,
            }));
            series.setData(lineData);
          }
        })
        .catch((error) => {
          console.error("Error fetching price history:", error);
        });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [timeframe, chartType]); // Re-run effect when timeframe or chartType changes

  return (
    <div>
      <div className="flex justify-center mb-4">
        {['1m', '5m', '15m', '1h', '4h', '1d', '1mo', '1y'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf as typeof timeframe)}
            className={`px-2 py-1 w-full md:w-2/3 m-1 rounded ${
              timeframe === tf 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setChartType(chartType === 'candlestick' ? 'line' : 'candlestick')}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Toggle to {chartType === 'candlestick' ? 'Line' : 'Candlestick'} Chart
        </button>
      </div>
      <div ref={chartContainerRef} style={{ position: 'relative' }} />
    </div>
  );
};

export default TradingViewChart; 