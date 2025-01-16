import { useState } from "react";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import { toast } from "react-toastify";
import SearchUsers from "../../components/Admin/SearchUsers";
import UserCard from "../../components/Admin/UserCard";
import axios from "axios";
import InputField from "../../components/InputField";
import BulkUpdateTransactions from "../../components/Admin/BulkUpdateTransactions";

function AdminTransaction() {
  const [users, setUsers] = useState([]); // Store users fetched from search
  const [selectedUser, setSelectedUser] = useState<any>(null); // Store selected user
  const [amount, setAmount] = useState("0");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [transactionType, setTransactionType] = useState("credit");

  // Handle user selection
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setAmount(user.lastTransactionAmount?.toString() || "0"); // Assuming `lastTransactionAmount` stores the previous transaction amount
    setAccountName(user.lastAccountName || "");
    setAccountNumber(user.lastAccountNumber || "");
  };

  // Handle Add Money form submission
  const handleAddMoney = async () => {
    if (!selectedUser || !amount || !accountName || !accountNumber) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const response = await axios.post("/api/add-money", {
        user_id: selectedUser.id,
        amount: parseFloat(amount),
        account_name: accountName,
        account_number: accountNumber,
        transaction_type: transactionType,
      });
      toast.success("Money added successfully!");
    } catch (error) {
      toast.error("Error adding money.");
    }
  };

  return (
    <AdminWrapper>
      <div className="my-16 max-w-4xl mx-auto px-6">
        {/* Search Bar with Suggestions */}
        <SearchUsers title="Admin Transaction" setUsers={setUsers} />

        {/* User Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <UserCard key={user.id} user={user} onSelect={handleSelectUser} />
          ))}
        </div>

        {/* Edit Transaction Slide-In Panel */}
        {selectedUser && (
          <div
            className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-10 transition-all duration-300 ${
              selectedUser ? "block" : "hidden"
            }`}
            onClick={() => setSelectedUser(null)} // Close the panel when clicking outside
          ></div>
        )}

        <div
          className={`fixed text-gray-600 top-0 right-0 bg-white p-6 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            selectedUser ? "translate-x-0" : "translate-x-full"
          } md:w-[35%] w-full h-screen`}
        >
          <span
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
            onClick={() => setSelectedUser(null)}
          >
            {/* X icon to close */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
          <h2 className="text-2xl font-semibold mb-4">
            Edit Transaction for {selectedUser?.full_name}
          </h2>
          <InputField
            label="Amount"
            name="amount"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <InputField
            label="Account Name"
            name="accountName"
            type="text"
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <InputField
            label="Account Number"
            name="accountNumber"
            type="text"
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <button
            onClick={handleAddMoney}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Update Transaction
          </button>
        </div>
        {/* Add BulkUpdateTransactions component */}
        <BulkUpdateTransactions />
      </div>
    </AdminWrapper>
  );
}
export default AdminTransaction;
