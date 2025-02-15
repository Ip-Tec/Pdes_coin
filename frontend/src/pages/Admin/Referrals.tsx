import { useState, useEffect } from "react";
import { User } from "../../utils/type";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import {
  getReferrals,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch top referrers
        const referrers = await getTopReferrersAdminPage(10);
        setReferrals(referrers);
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setError("Failed to load referrals");
        toast.error("Failed to load referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // User Permissions
  const userRole = user?.role || "";
  const canEdit = ["ADMIN", "SUPER_ADMIN", "OWNER"].includes(userRole);
  const canDelete = ["ADMIN", "SUPER_ADMIN", "OWNER"].includes(userRole);
  const canExport = ["ADMIN", "SUPER_ADMIN", "OWNER"].includes(userRole);
  const canViewStats = ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN", "OWNER"].includes(userRole);

  // Chart Data
  const chartData = {
    labels: referrals.map((r) => r.full_name),
    datasets: [
      {
        label: "Total Referrals",
        data: referrals.map((r) => r.total_referrals),
        backgroundColor: "#6366F1",
        borderColor: "#4F46E5",
        borderWidth: 2,
      },
    ],
  };

  return (
    <AdminWrapper>
      <div className="p-6 mb-4 md:p-10 min-h-screen w-full text-gray-800">
        <h2 className="text-3xl font-bold my-6 text-bgColor">Referrals</h2>

        {canExport && (
          <button className="bg-primary-light hover:bg-bgColor text-white px-4 py-2 rounded mb-4">
            Export Data
          </button>
        )}

        {/* Error and Loading States */}
        {loading && <p className="text-gray-500">Loading referrals...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Table */}
        {!loading && !error && referrals.length > 0 ? (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-primary-light text-white uppercase text-sm">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Referral Reward</th>
                  {canEdit && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral: User, index) => (
                  <tr
                    key={referral.id}
                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}
                  >
                    <td className="p-3">{referral.full_name}</td>
                    <td className="p-3">{referral.email}</td>
                    <td className="p-3">{referral.referral_code}</td>
                    <td className="p-3 font-bold text-primary-light">
                      {referral.referral_reward}
                    </td>
                    {canEdit && (
                      <td className="p-3">
                        <button className="text-blue-500 hover:text-blue-700 mr-2">
                          Edit
                        </button>
                        {canDelete && (
                          <button className="text-red-500 hover:text-red-700">
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-500">No referrals found.</p>
        )}

        {/* Chart Section */}
        {canViewStats && referrals.length > 0 && (
          <div className="mt-8 p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700">Referral Statistics</h3>
            <Bar data={chartData} />
          </div>
        )}
      </div>
    </AdminWrapper>
  );
};

export default Referrals;
