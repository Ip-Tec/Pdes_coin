import React, { useState } from "react";
import DistributionChart from "./DistributionChart"; // Import your DistributionChart
import ProportionChart from "./ProportionChart"; // Import your ProportionChart

const ChartWithToggle: React.FC = () => {
  const [chartType, setChartType] = useState<"currency" | "transaction_type">(
    "transaction_type"
  );

  const toggleChartType = () => {
    setChartType((prevType) =>
      prevType === "currency" ? "transaction_type" : "currency"
    );
  };

  return (
    <div className="w-auto px-3 h-auto">
      <div className="flex w-full items-center justify-between mb-4">
        <button
          onClick={toggleChartType}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Chart Type
        </button>
        <p className="text-lg">
          Current Chart Type:{" "}
          {chartType === "currency" ? "Currency" : "Withdrawal/Deposit"}
        </p>
      </div>

      <div className="bg-white flex gap-2 flex-wrap md:flex-nowrap justify-between items-center shadow-md w-full rounded-lg p-4 mt-6 mt-14">
        <DistributionChart />
        <ProportionChart type={chartType} />
      </div>
    </div>
  );
};

export default ChartWithToggle;
