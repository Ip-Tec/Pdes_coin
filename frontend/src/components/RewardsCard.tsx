import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { formattedMoneyUSD } from "../utils/formatters";
import API from "../services/api";
import { toast } from "react-toastify";

const RewardsCard: React.FC = () => {
  const { user, setUser } = useAuth();

  const handleClaimRewards = async () => {
    try {
      const response = await API.post("/api/claim-rewards");
      const { reward } = response.data;
      toast.success(`Rewards claimed: ${formattedMoneyUSD(reward)}`);

      // Update user balance locally
      if (user) {
        setUser({ ...user, balance: user.balance + reward });
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards. Please try again.");
    }
  };

  return (
    <div className="bg-secondary text-white rounded-lg rounded-t-none p-4 shadow-md">
      <h3 className="text-lg font-semibold">Rewards Earned</h3>
      <p className="text-2xl font-bold">
        {formattedMoneyUSD(user?.rewards_earned || 0)}
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
