import InputField from "../InputField";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { confirmUserDeposit } from "../../services/adminAPI";
import { DepositPropsWithUser, User } from "../../utils/type";
import {
  TbCoinBitcoin,
  TbCurrencyEthereum,
  TbCurrencyNaira,
} from "react-icons/tb";
import { formattedMoneyNGN } from "../../utils/helpers";

interface UserCardProps {
  user?: User | DepositPropsWithUser;
}

const ConfirmTransaction = ({ user }: UserCardProps) => {
  // const [amount] = useState<string>();
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("deposit");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cryptoName, setCryptoName] = useState<string>("BTC");

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log({ amount, accountName, accountNumber });


    if (!accountName || !accountNumber) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    if (!user) {
      toast.info("User not found.");
      return;
    }

    const data = {
      user_id: "user_id" in user ? user.user_id : user.id,
      crypto_name: cryptoName,
      amount: "amount" in user && user.amount,
      account_name: accountName,
      account_number: accountNumber,
      transaction_type: transactionType,
      ...user,
    };

    // console.log(data);

    try {
      // console.log({ data });
      // const response = 
      await confirmUserDeposit(data);
      // console.log("Response:", response.data);
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
          <p className="text-sm text-gray-400">
            {user && "full_name" in user
              ? user.full_name
              : user?.user.full_name}
          </p>
          <p className="text-sm text-gray-400">
            {user && "full_name" in user ? user.balance : user?.user.balance}
          </p>
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
            <strong>User:</strong>{" "}
            {"full_name" in user ? user.full_name : user?.user.full_name}
          </p>
          <p className="text-lg mb-2">
            <strong>Email:</strong>{" "}
            {"email" in user ? user.email : user?.user.email}
          </p>
          <p className="text-lg mb-2">
            <strong>Balance:</strong>{" "}
            {"balance" in user ? user.balance : user?.user.balance}
          </p>
          <p className="text-lg mb-2">
            <strong>PDES Balance:</strong>{" "}
            {"user" in user && user.user.crypto_balance}
          </p>
          <p className="text-lg mb-2">
            <strong>Joined:</strong>{" "}
            {new Date(user.created_at).toLocaleString()}
          </p>
          <p className="text-lg mb-4">
            <strong>Role:</strong>{" "}
            {"role" in user ? user.role : user?.user.role}
          </p>
        </div>
      )}

      {/* Form Section */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-4">Confirm Transaction</h2>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4 px-4">
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

            {/* Toggle between naira and crypto */}

            <div className="flex justify-between items-center space-x-4">
              <label className="block text-sm font-bold mb-1">Currency</label>

              <div className="flex items-center space-x-4">
                {/* Naira Icon (Only Visible in Deposit) */}
                <div
                  className={`cursor-pointer p-2 rounded-full border ${
                    cryptoName === "naira" ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  onClick={() => {
                    setCryptoName("naira"); // Default to Naira if deposit is selected
                  }}
                >
                  <TbCurrencyNaira className="text-3xl" />
                </div>

                {/* Show Withdrawal Options (Visible Only When Withdrawal is Selected) */}
                {/* {transactionType === "withdrawal" && ( */}
                <>
                  <div
                    className={`cursor-pointer p-2 rounded-full border ${
                      cryptoName === "BTC" ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() => setCryptoName("BTC")}
                  >
                    <TbCoinBitcoin className="text-3xl text-yellow-500" />
                  </div>

                  <div
                    className={`cursor-pointer p-2 rounded-full border ${
                      cryptoName === "ETH" ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() => setCryptoName("ETH")}
                  >
                    <TbCurrencyEthereum />
                  </div>
                </>
                {/* )} */}
              </div>
            </div>

            <InputField
              label="Amount"
              type="text"
              name="amount"
              value={
                "amount" in user
                  ? formattedMoneyNGN(user.amount) // Display formatted amount
                  : "N/A"
              }
              readOnly
              className="bg-gray-200 cursor-not-allowed"
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
              value={accountNumber}
              placeholder="Enter account number"
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <button
              type="submit"
              className="bg-blue-600 top-8 capitalize text-white px-4 py-2 flex justify-center items-center w-3/4 m-auto hover:bg-blue-700 rounded-full"
              disabled={loading}
              style={{ marginTop: "2rem" }}
            >
              {loading ? "Processing..." : "Confirm " + transactionType}
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
