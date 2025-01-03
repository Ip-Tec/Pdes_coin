import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import BalanceCard from "../components/BalanceCard";
import Navigation from "../components/NavigationBar";
import QuickActions from "../components/QuickActions";
import TransactionList from "../components/TransactionList";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user, transactions, setUserData, setDashboardData } = useAuth(); // Destructure setUserData, setDashboardData
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboard();
        setUserData(data.user, data.transactions); // Update context with the data
        setDashboardData(data); // Update the dashboard data in context
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [setUserData, setDashboardData]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <p className="text-xl font-bold text-gray-500">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }
  

  // If user exists, render dashboard components
  return (
    <div className="h-screen bg-mainBG pb-16 overflow-hidden">
      {/* Desktop Layout */}
      <div className="lg:flex lg:space-x-6 m-2 overflow-hidden">
        {/* Fixed Left Section for Desktop */}
        <div className="lg:w-1/3 lg:sticky lg:top-6 lg:mt-[25%]">
          <BalanceCard
            id={user.id}
            email={user.email}
            full_name={user.full_name}
            username={user.username}
            balance={user.balance}
            crypto_balance={user.crypto_balance}
            referral_code={user.referral_code}
            total_referrals={user.total_referrals}
            referral_reward={user.referral_reward}
            created_at={user.created_at}
          />
          <QuickActions />
        </div>

        {/* Right Section */}
        <div className="lg:w-2/3 m-2 h-screen overflow-scroll no-scrollbar">
          {transactions?.length === 0 ? (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-black">Transactions</h2>
              <p className="text-center text-gray-500">
                You have not made any transactions yet.
              </p>
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <Navigation />
    </div>
  );
};

export default Dashboard;
