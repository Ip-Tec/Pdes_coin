
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import TransactionList from "../components/TransactionList";
import Navigation from "../components/NavigationBar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-mainBG pb-16"> 
      {/* Desktop Layout */}
      <div className="lg:flex lg:space-x-6 m-2">
        {/* Fixed Left Section for Desktop */}
        <div className="lg:w-1/3 lg:sticky lg:top-6">
          <BalanceCard />
          <QuickActions />
        </div>

        {/* Right Section */}
        <div className="lg:w-2/3 m-2">
          <TransactionList />
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <Navigation />
    </div>
  );
};

export default Dashboard;
