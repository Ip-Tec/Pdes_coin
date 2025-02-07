import { useEffect, useState } from "react";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import TransactionList from "../components/TransactionList";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import { getUser } from "../services/api";

const Dashboard = () => {
  const { user, setUser, isAuth } = useAuth();
  const [isLoading] = useState<boolean>(false);
  const navigate = useNavigate();


  useEffect(() => {
    // fetchUser();

    if (!isAuth) {
      navigate("/login");
    }
    if (!user) {
      navigate("/login");
    }
  }, [isAuth, navigate, setUser, user]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <h2 className="text-9xl font-bold text-black">Loading...</h2>
        <Loading isLoading={isLoading} />
      </div>
    );
  }


  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <h2 className="text-7xl font-bold text-black">User not found</h2>
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="bg-mainBG pb-16 overflow-hidden mb-18 md:mb-2">
      <ToastContainer />
      <div className="md:flex relative md:space-x-6 m-2 overflow-hidden">
        {/* Left Section - Fixed on md screens only */}
        <div className="md:w-1/2 md:sticky md:top-4 md:mt-[15%] lg:static lg:top-auto">
          <BalanceCard {...user} />
          <QuickActions />
        </div>

        {/* Right Section - Transactions (Takes full width on small screens) */}
        <div className="md:w-1/2 md:ml-[34%] m-2 h-auto overflow-scroll no-scrollbar">
          <TransactionList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
