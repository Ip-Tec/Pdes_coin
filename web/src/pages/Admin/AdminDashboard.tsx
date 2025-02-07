import { useEffect, useState } from "react";
import { Line, PolarArea, Bar } from "react-chartjs-2";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
} from "chart.js";
import {
  getDataOverview,
  getDashboardTotal,
  getTopReferrers,
  getTransactionTrends,
  getTopUsersByBalance,
} from "../../services/adminAPI";
import PriceChart from "../../components/PriceChart";
import { useAuth } from "../../contexts/AuthContext";

// Register chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale
);

interface DashboardData {
  total_users: number;
  total_deposits: number;
  total_rewards: number;
  total_transactions: number;
  total_withdrawals: number;
}

interface Referral {
  name: string;
  total_referrals: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [totalDashboard, setTotalDashboard] = useState<
    DashboardData | undefined
  >(undefined);
  const [transactionTrends, setTransactionTrends] = useState([]);
  const [topReferrers, setTopReferrers] = useState<Referral[]>([]);
  const [polarData, setPolarData] = useState();
  const [topchartData, setTopChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Get dashboard data
      const getDashboard = await getDashboardTotal();
      // Get transaction trends
      const getTransaction = await getTransactionTrends();
      // Get Top Referrers
      const getReferrers = await getTopReferrers();
      // Get data overview
      const dataOverview = await getDataOverview();
      // Get Top Users with the highest Balance
      const topUsersByBalance = await getTopUsersByBalance();

      setPolarData(dataOverview);
      setTopReferrers(getReferrers);
      setTotalDashboard(getDashboard);
      setTransactionTrends(getTransaction);

      const { top_users_by_balance, top_users_by_crypto_balance } =
        topUsersByBalance;

      // Prepare chart data
      setTopChartData({
        labels: top_users_by_balance.map((user: { name: string }) => user.name), // User names

        datasets: [
          {
            label: "Balance",
            data: top_users_by_balance.map(
              (user: { balance: number }) => user.balance
            ),
            backgroundColor: "#FF6384",
            borderColor: "#FF6384",
            borderWidth: 1,
          },

          {
            label: "Crypto Balance",
            data: top_users_by_crypto_balance.map(
              (user: { crypto_balance: number }) => user.crypto_balance
            ),
            backgroundColor: "#36A2EB",
            borderColor: "#36A2EB",
            borderWidth: 1,
          },
        ],
      });
    };

    fetchDashboardData();
    document.title = "Admin Dashboard";
  }, []);

  const [isBarChart, setIsBarChart] = useState(false); // Toggle between table and bar chart

  const chartOptions = {
    indexAxis: "y" as const, // Horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  // Bar Chart Data for Top 10 Referrals
  const barData = {
    labels: topReferrers.map((referrer) => referrer.name), // Referral names
    datasets: [
      {
        label: "Top 10 Referrals",
        data: topReferrers.map((referrer) => referrer.total_referrals), // Referral counts
        backgroundColor: "#36A2EB",
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
    ],
  };

  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Transactions",
        data: transactionTrends,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <>
      <AdminWrapper>
        <div className="w-auto px-4 py-20 mb-6">
          {/* Stats Section */}

          {user!.role in ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"] ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Transactions
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDashboard?.total_transactions ?? "Loading..."}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Deposits
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDashboard?.total_deposits ?? "Loading..."}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Withdrawals
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDashboard?.total_withdrawals ?? "Loading..."}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Rewards
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDashboard?.total_rewards.toFixed(2) ?? "Loading..."}
                </p>
              </div>{" "}
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total User
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDashboard?.total_users ?? "Loading..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-3xl w-full m-auto text-black text-center">DashBoard</div>
          )}
          <div className="flex m-auto justify-center items-center mt-4 w-full p-2">
            <PriceChart />
          </div>

          <div className="flex w-full flex-wrap gap-2 justify-evenly items-center">
            {/* Polar Area Chart Section */}
            <div className="bg-white shadow-md w-1/2 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Data Overview (Polar Area)
              </h3>
              {polarData ? <PolarArea data={polarData} /> : <p>Loading...</p>}
            </div>

            {/* HorizontalBar Chart for user with the highest balance and crypto balance */}
            <div className="bg-white shadow-md rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                User with the highest balance and crypto balance
              </h3>
              <div>
                <h2>Top Users by Balance and Crypto Balance</h2>
                {topchartData.datasets.length > 0 ? (
                  <Bar data={topchartData} options={chartOptions} />
                ) : (
                  <p>Loading chart...</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-evenly items-center">
            {/* Chart Section */}
            <div className="bg-white shadow-md w-1/2 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Transaction Trends
              </h3>
              <Line data={chartData} />
            </div>
            {/* Table or Bar Chart for Top 10 Referrals */}
            <div className="bg-white text-textColor shadow-md rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Top 10 Referrals
              </h3>
              <div className="mb-4">
                <button
                  onClick={() => setIsBarChart(!isBarChart)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Toggle {isBarChart ? "Table" : "Bar Chart"}
                </button>
              </div>

              {isBarChart ? (
                <Bar data={barData} />
              ) : (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Referral</th>
                      <th className="px-4 py-2 text-left">Referral Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReferrers.map((referrer, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{referrer.name}</td>
                        <td className="px-4 py-2">
                          {referrer.total_referrals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </AdminWrapper>
    </>
  );
};
export default AdminDashboard;
