import React from 'react';
import TradingViewChart from './TradingViewChart';

const PriceChart: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white">PDES</h2>
      <TradingViewChart />
    </div>
  );
};

export default PriceChart;
