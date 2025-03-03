import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formattedMoneyUSD } from '../utils/formatters';

const RewardsCard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-secondary text-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold">Rewards Earned</h3>
      <p className="text-2xl font-bold">{formattedMoneyUSD(user?.rewards_earned || 0)}</p>
      <p className="text-sm mt-2">Daily reward rate: {user?.reward_rate || 0.15}%</p>
      <p className="text-xs mt-1">Earned on your crypto balance</p>
    </div>
  );
};

export default RewardsCard; 