import { useState, useEffect } from "react";
import { User } from "../../utils/type";
import AdminWrapper from "../../components/Admin/AdminWrapper";

const Referrals = () => {
  const [referrals, setReferrals] = useState<User[]>([]);

  useEffect(() => {
    // Fetch referral data (replace with actual API call)
    setReferrals([
      {
        id: 1,
        full_name: "John Doe",
        referral_code: "4",
        referral_reward: 5,
        role: "",
        email: "",
        username: "",
        balance: 0,
        total_referrals: 0,
        created_at: "",
      },
      {
        id: 2,
        full_name: "Jane Smith",
        referral_code: "4",
        referral_reward: 3,
        role: "",
        email: "",
        username: "",
        balance: 0,
        total_referrals: 0,
        created_at: "",
      },
      // More referrals...
    ]);
  }, []);
  return (
    <AdminWrapper>
      <div className="p-4 md:p-8 min-h-screen my-16 w-auto relative text-gray-600">
        <h2>Referrals</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Referred User</th>
              <th>Referral Reward</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral: User) => (
              <tr key={referral.id}>
                <td>{referral.full_name}</td>
                <td>{referral.email}</td>
                <td>{referral.referral_code}</td>
                <td>{referral.referral_reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminWrapper>
  );
};

export default Referrals;
