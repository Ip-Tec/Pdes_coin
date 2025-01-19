import React, { useState } from "react";
import DistributionChart from "./DistributionChart"; // Import your DistributionChart
import ProportionChart from "./ProportionChart"; // Import your ProportionChart

const ChartWithToggle: React.FC = () => {
  const [chartType, setChartType] = useState<"currency" | "transaction_type">(
    "currency"
  );

  const toggleChartType = () => {
    setChartType((prevType) =>
      prevType === "currency" ? "transaction_type" : "currency"
    );
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={toggleChartType}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Chart Type
        </button>
        <p className="text-lg">
          Current Chart Type:{" "}
          {chartType === "currency" ? "Currency" : "Transaction Type"}
        </p>
      </div>

      <div className="flex w-full m-auto justify-evenly items-center flex-wrap md:flex-nowrap gap-4">
        <div className="w-1/2">
          <DistributionChart />
        </div>
        <div className="w-1/2">
          <ProportionChart type={chartType} />
        </div>
      </div>
    </div>
  );
};

export default ChartWithToggle;
