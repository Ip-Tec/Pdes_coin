
import BalanceCard from "../components/BalanceCard";
import Navigation from "../components/NavigationBar";
import QuickActions from "../components/QuickActions";
import TransactionList from "../components/TransactionList";

const Dashboard = () => {
  return (
    <div className="h-screen bg-mainBG pb-16 overflow-hidden"> 
      {/* Desktop Layout */}
      <div className="lg:flex lg:space-x-6 m-2 overflow-hidden">
        {/* Fixed Left Section for Desktop */}
        <div className="lg:w-1/3 lg:sticky lg:top-6 lg:mt-[25%]">
          <BalanceCard />
          <QuickActions />
        </div>

        {/* Right Section */}
        <div className="lg:w-2/3 m-2 h-screen overflow-scroll no-scrollbar">
          <TransactionList />
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <Navigation />
    </div>
  );
};

export default Dashboard;
