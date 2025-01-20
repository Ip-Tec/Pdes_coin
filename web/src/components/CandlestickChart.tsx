import React, { useEffect, useRef } from "react";
import { ColorType, createChart, CrosshairMode } from "lightweight-charts";
import { CandlestickChartProps } from "../utils/type";

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  console.log(data);

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

    // Sort and filter data
    const processedData = [...data]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .filter(
        (value, index, self) =>
          index === 0 ||
          new Date(value.time).getTime() !==
            new Date(self[index - 1].time).getTime()
      );

    candlestickSeries.setData(processedData);

    return () => {
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ position: "relative" }} />;
  return <h1>In Developement.</h1>;
};

export default CandlestickChart;
