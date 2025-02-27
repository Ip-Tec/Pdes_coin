import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "../../utils/type";

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({});

  // Fetch users every time filters change
  useEffect(() => {
    console.log(document.cookie.toString());
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/admin/users", { params: filters });
        console.log("Response data:", response.data); // Check the structure
        // Update this line based on the response structure:
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.users;
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [filters]);

  // When a column header is clicked, update filters
  const handleColumnClick = (column: string, value: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
  };

  // Optionally, a reset function for filters
  const handleResetFilters = () => {
    setFilters({});
  };

  // To fetch transaction history for a user
  const viewTransactions = async (userId: number) => {
    try {
      const res = await axios.get(`/admin/users/${userId}/transactions`);
      console.log("Transactions for user", userId, { res });
      // You might want to show these in a modal or separate component
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  return (
    <div className="p-4 text-black overflow-x-scroll no-scrollbar">
      {/* Filter inputs at the top */}
      <div className="mb-4 flex flex-wrap items-center justify-center">
        <input
          type="number"
          placeholder="Min Balance"
          className="p-1 gap-2 border rounded bg-transparent"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, balance_min: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Max Balance"
          className="px-2 py-1 border rounded bg-transparent"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, balance_max: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Min Crypto"
          className="px-2 py-1 border rounded bg-transparent"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, crypto_min: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Max Crypto"
          className="px-2 py-1 border rounded bg-transparent"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, crypto_max: e.target.value }))
          }
        />
        <button
          onClick={handleResetFilters}
          className="px-4 py-1 bg-blue-500 text-white rounded"
        >
          Reset
        </button>
      </div>

      {/* Users Table */}
      <table className="min-w-full bg-transparent">
        <thead>
          <tr className="border-b">
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() =>
                // Example: clicking referrer_id header applies a filter (you may need to adjust the value)
                handleColumnClick("referrer_id", "some-referrer-id")
              }
            >
              Referrer ID
            </th>
            <th className="px-4 py-2">Full Name</th>
            <th className="px-4 py-2">Email</th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() =>
                handleColumnClick("balance", "example-balance-value")
              }
            >
              Balance
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() =>
                handleColumnClick("crypto_balance", "example-crypto-value")
              }
            >
              Crypto
            </th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr className="border-b" key={user.id}>
                <td
                  className="px-4 py-2 cursor-pointer"
                  onClick={() =>
                    handleColumnClick(
                      "referrer_id",
                      user.referrer_id?.toString() ?? ""
                    )
                  }
                >
                  {user.referrer_id || "N/A"}
                </td>
                <td className="px-4 py-2">{user.full_name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td
                  className="px-4 py-2 cursor-pointer"
                  onClick={() =>
                    handleColumnClick("balance", user.balance.toString())
                  }
                >
                  {user.balance}
                </td>
                <td
                  className="px-4 py-2 cursor-pointer"
                  onClick={() =>
                    handleColumnClick("balance", user.balance.toString())
                  }
                >
                  {user.crypto_balance}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => viewTransactions(user.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Transactions
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
