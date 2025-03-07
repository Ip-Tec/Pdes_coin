import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { formattedMoneyUSD } from "../utils/formatters";

const RewardsCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClaimRewards = async () => {
    // Navigate to the withdraw page with reward parameter
    navigate("/withdraw/reward");
  };

  return (
    <div className="bg-secondary text-white rounded-lg rounded-t-none p-4 shadow-md">
      <h3 className="text-lg font-semibold">Rewards Earned</h3>
      <p className="text-2xl font-bold">
        {formattedMoneyUSD(user?.referral_reward || 0)}
      </p>
      <p className="text-sm mt-2">
        Daily reward rate: {user?.reward_rate || 0.15}%
      </p>
      <p className="text-xs mt-1">Earned on your crypto balance</p>
      {/* TODO: Add a button to claim rewards */}
      <div className="flex justify-between gap-2">
        <button className="px-4 py-2"></button>
        <button
          onClick={handleClaimRewards}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          Claim Rewards
        </button>
      </div>
    </div>
  );
};

export default RewardsCard;
