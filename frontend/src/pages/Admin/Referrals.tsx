import { useState, useEffect } from "react";
import { User } from "../../utils/type";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import {
  getReferrals,
  getReferrerAndReward,
  getReferrersInRange,
  getTopReferrersAdminPage,
} from "../../services/adminAPI";
import { useAuth } from "../../contexts/AuthContext";
import { AxiosError } from "axios";

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        //  These calls need to be handled individually and their data processed.
        //  The current code overwrites the referrals state repeatedly.  I'm assuming
        // you want ALL the referral data, not just the last call's data.

        const referralsData = await getReferrals();
        const rangeData = await getReferrersInRange("1", "222"); // You'll need to handle the range data
        const topReferrers = await getTopReferrersAdminPage(); // And the top referrers
        const referrerReward = await getReferrerAndReward(user!.id); // And the referrer reward

        // Example combining data (adjust as needed based on your API responses)
        // Check if referralsData is an array
        if (Array.isArray(referralsData) && Array.isArray(rangeData) && Array.isArray(topReferrers)) {
          const allReferrals = [
            ...referralsData,
            ...rangeData,
            ...topReferrers,
            referrerReward,
          ];
          setReferrals(allReferrals);
        } else {
          // Handle the case where referralsData is not an array (i.e., it's an ErrorResponse)
          setError("Failed to fetch referrals.");

          console.error("Error fetching referrals:", referralsData);
        }
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.message || "Failed to fetch referrals.");
          console.error("Error fetching referrals:", err);
        } else {
          // Handle other types of errors
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Add user to dependency array

  if (loading) {
    return <AdminWrapper>Loading referrals...</AdminWrapper>;
  }

  if (error) {
    return (
      <AdminWrapper>
        <div className="text-red-500">Error: {error}</div>
      </AdminWrapper>
    );
  }

  return (
    <AdminWrapper>
      <div className="p-4 md:p-8 min-h-screen my-16 w-auto relative text-gray-600">
        <h2 className="text-2xl font-semibold mb-4">Referrals</h2>

        {referrals.length === 0 ? (
          <p>No referrals found.</p>
        ) : (
          <table className="min-w-full border border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">User</th>
                <th className="border px-4 py-2">Referred User</th>{" "}
                {/*  If available */}
                <th className="border px-4 py-2">Referral Code</th>{" "}
                {/* If available */}
                <th className="border px-4 py-2">Referral Reward</th>
                {/* Add more columns as needed */}
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral: User) => (
                <tr key={referral.id} className="border-b hover:bg-gray-50">
                  <td className="border px-4 py-2">{referral.full_name}</td>
                  <td className="border px-4 py-2">{referral.email}</td>{" "}
                  {/* Or referred user name */}
                  <td className="border px-4 py-2">{referral.referral_code}</td>
                  <td className="border px-4 py-2">
                    {referral.referral_reward}
                  </td>
                  {/* Add more data cells as needed */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminWrapper>
  );
};

export default Referrals;
