import { useEffect, useState } from "react";
import BalanceCard from "../components/BalanceCard";
import Navigation from "../components/NavigationBar";
import QuickActions from "../components/QuickActions";
import TransactionList from "../components/TransactionList";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const Dashboard = () => {
  const { user, getUser, setUser, transactions, logout, isAuth } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  // The transactions are already available in the context, no need to fetch them here
  useEffect(() => {
    // If we need to load additional data, we can trigger a loading state
    setIsLoading(false); // Set loading to false once the data is ready
  }, [transactions]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else if (getUser) {
          try {
            const fetchedUser = await getUser(); // Use the function
            if (fetchedUser) {
              setUser(fetchedUser);
              localStorage.setItem("user", JSON.stringify(fetchedUser));
            }
          } catch (error) {
            toast.error(`Failed to fetch user: ${error}`);
            handleLogout();
          }
        }
      }
    };

    fetchUser();
  }, [user, getUser, setUser]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  if (!user) {
    return null; // or a loading indicator
  }

  // If user exists, render dashboard components
  return (
    <div className="h-screen bg-mainBG pb-16 overflow-hidden">
      <ToastContainer />
      {/* Desktop Layout */}
      <div className="lg:flex lg:space-x-6 m-2 overflow-hidden">
        {/* Fixed Left Section for Desktop */}
        <div className="lg:w-1/3 lg:sticky lg:top-4 lg:mt-[15%]">
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
