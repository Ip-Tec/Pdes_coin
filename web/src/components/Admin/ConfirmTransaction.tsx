import InputField from "../InputField";
import React, { useState } from "react";
import { User } from "../../utils/type";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { confirmUserDeposit } from "../../services/adminAPI";

interface UserCardProps {
  user?: User | null;
}

const ConfirmTransaction = ({ user }: UserCardProps) => {
  const [amount, setAmount] = useState<number | string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("deposit");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountName || !accountNumber) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await confirmUserDeposit({
        id: user?.id,
        amount: parseFloat(amount as string),
        account_name: accountName,
        account_number: accountNumber,
        transaction_type: transactionType,
      });

      if (response.status === 201) {
        toast.success("Transaction confirmed successfully!");
      } else {
        toast.error("Failed to confirm transaction.");
      }

      console.log("Response:", response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong. Try again.");
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-600 pb-28 h-screen no-scrollbar overflow-y-scroll">
      <ToastContainer />

      {/* Accordion Section */}
      <div
        className="flex justify-between items-center cursor-pointer border-b pb-2 mb-4"
        onClick={toggleAccordion}
      >
        <div className="flex flex-col justify-between items-center">
          <h2 className="text-2xl font-bold">User Details</h2>
          <p className="text-sm text-gray-400">{user && user.full_name}</p>
          <p className="text-sm text-gray-400">{user && user.balance}</p>
        </div>
        {isOpen ? (
          <FaChevronUp className="text-gray-600" />
        ) : (
          <FaChevronDown className="text-gray-600" />
        )}
      </div>

      {isOpen && user && (
        <div className="mb-6">
          <p className="text-lg mb-2">
            <strong>User:</strong> {user.full_name}
          </p>
          <p className="text-lg mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-lg mb-2">
            <strong>Balance:</strong> {user.balance}
          </p>
          <p className="text-lg mb-2">
            <strong>PDES Balance:</strong> {user.crypto_balance}
          </p>
          <p className="text-lg mb-2">
            <strong>Joined:</strong>{" "}
            {new Date(user.created_at).toLocaleString()}
          </p>
          <p className="text-lg mb-4">
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}

      {/* Form Section */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-4">Confirm Transaction</h2>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4 px-4">
            <InputField
              label="Amount"
              type="number"
              name="amount"
              value={amount.toString()}
              step="0.01"
              onChange={(e) => setAmount(e.target.value)}
            />
            <InputField
              label="Account Name"
              type="text"
              name="accountName"
              value={accountName}
              placeholder="Enter account name"
              onChange={(e) => setAccountName(e.target.value)}
            />

            <InputField
              label="Account Number"
              type="text"
              name="accountNumber"
              onChange={(e) => setAccountNumber(e.target.value)}
              value={accountNumber}
              placeholder="Enter account number"
            />

            <label className="block text-sm font-bold mb-1">
              Transaction Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full border bg-slate-300 text-textColor border-gray-300 rounded-md p-2"
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 flex justify-center items-center w-3/4 m-auto hover:bg-blue-700 rounded-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Transaction"}
            </button>
          </form>
        ) : (
          <p className="text-lg">No user data available.</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmTransaction;
