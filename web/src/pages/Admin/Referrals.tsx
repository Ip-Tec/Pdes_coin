import { useState, useEffect } from "react";

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    // Fetch referral data (replace with actual API call)
    setReferrals([
      { id: 1, user: "John Doe", referred_user: "James Lee", reward: "$5" },
      { id: 2, user: "Jane Smith", referred_user: "Alice Brown", reward: "$3" },
      // More referrals...
    ]);
  }, []);

  return (
    <div className="referrals">
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
          {referrals.map((referral) => (
            <tr key={referral.id}>
              <td>{referral.user}</td>
              <td>{referral.referred_user}</td>
              <td>{referral.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Referrals;
