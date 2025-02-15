import { useState, useEffect } from "react";
import { User } from "../../utils/type";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import {
  getTopReferrersAdminPage,
  getReferrerAndReward,
  getReferrersInRange,
} from "../../services/adminAPI";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [referralRewards, setReferralRewards] = useState([]);
  const [filteredReferrers, setFilteredReferrers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  console.log({ referralRewards });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const referrers = await getTopReferrersAdminPage(10);
        setReferrals(referrers as User[]);

        const rewards = await getReferrerAndReward(user!.id);
        setReferralRewards(rewards);
      }  catch (err) {
        setError("Failed to load referrals");
        toast.error("Failed to load referrals");
        console.error("Error fetching referrals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, user?.id]);

  const fetchReferrersInRange = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const filteredReferrers = await getReferrersInRange(startDate, endDate);
      setFilteredReferrers(filteredReferrers as User[]);
    } catch (err) {
      console.error("Error fetching referrers in range:", err);
      setError("Failed to load filtered referrers");
      toast.error("Failed to load filtered referrers");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: referrals.map((ref) => ref.full_name),
    datasets: [
      {
        label: "Referral Rewards",
        data: referrals.map((ref) => ref.referral_reward),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminWrapper>
      <div className="p-6 mb-4 md:p-10 min-h-screen w-full text-gray-800">
        <h2 className="text-3xl font-bold my-6 text-bgColor">Referrals</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search referrals..."
            className="border p-2 rounded w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-primary-light hover:bg-bgColor text-white px-4 py-2 rounded"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="bg-primary-light hover:bg-bgColor text-white px-4 py-2 rounded"
            onClick={fetchReferrersInRange}
          >
            Filter by Date
          </button>
        </div>
        <div className="my-6">
          <h3 className="text-2xl font-bold">Referral Rewards Chart</h3>
          <Bar data={chartData} />
        </div>
        {loading && <p className="text-gray-500">Loading referrals...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && filteredReferrers.length > 0 ? (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-primary-light text-white uppercase text-sm">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Referral Reward</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrers.map((referral: User, index) => (
                  <tr
                    key={referral.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="p-3">{referral.full_name}</td>
                    <td className="p-3">{referral.email}</td>
                    <td className="p-3">{referral.referral_code}</td>
                    <td className="p-3 font-bold text-primary-light">
                      {referral.referral_reward}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-500">No referrals found.</p>
        )}
      </div>
    </AdminWrapper>
  );
};

export default Referrals;
