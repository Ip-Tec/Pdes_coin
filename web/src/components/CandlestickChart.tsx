import React, { useEffect, useRef } from "react";
import { ColorType, createChart, CrosshairMode } from "lightweight-charts";
import { CandlestickChartProps } from "../utils/type";


const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#ffffff",
        },
        textColor: "#000000",
      },
      grid: {
        vertLines: {
          color: "#e0e0e0",
        },
        horzLines: {
          color: "#e0e0e0",
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#cccccc",
      },
      timeScale: {
        borderColor: "#cccccc",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(data);

    return () => {
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ position: "relative" }} />;
};

export default CandlestickChart;
