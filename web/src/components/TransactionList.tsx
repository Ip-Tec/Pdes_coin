// import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import { TransactionHistory } from "../utils/type";

// interface TransactionListProps {
//   transactions: TransactionHistory[];
// }

const TransactionList = () => {
  // Check if transactions is an empty array or not passed at all
  // console.log({ transactions });
  const { transactions } = useAuth();
  console.log(transactions);

  if (!transactions || transactions.length <= 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-700">Transactions</h3>
        <p className="text-center text-gray-500">
          You have no transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-48 overflow-y-auto no-scrollbar ">
      <div className="flex justify-between items-center mt-6 text-black min-h-fit">
        <h3 className="text-lg font-bold">Transactions</h3>
        {/* <Link to="#" className="text-primary hover:underline">
          See All
        </Link> */}
      </div>
      <div className="mt-3 space-y-3 flex flex-col">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex group text-white justify-between items-center p-4 rounded-lg shadow ${
              transaction.transaction_type
                .toString()
                .toLowerCase()
                .startsWith("deposit")
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            <div>
              <p className="text-sm font-medium">
                {transaction.account_name.split(" ")[0] || "Unknown"}
              </p>
              <p className="text-xs text-gray-300 group-hover:text-white">
                {new Date(transaction.created_at ?? "").toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p
                className={` text-white ${
                  transaction.transaction_type.toString().startsWith("deposit")
                    ? "text-green-500"
                    : "text-red-500"
                } font-semibold`}
              >
                {transaction.amount}
              </p>
              <p className="text-xs text-gray-300 group-hover:text-white">
                {transaction.transaction_type.startsWith("deposit")
                  ? transaction.transaction_type.toUpperCase()
                  : "WITHDRAW"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
