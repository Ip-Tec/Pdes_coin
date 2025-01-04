import { TransactionHistory } from "../utils/type";

interface TransactionListProps {
  transactions: TransactionHistory[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  // Check if transactions is an empty array or not passed at all
  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-700">Transactions</h3>
        <p className="text-center text-gray-500">You have no transactions yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mt-6 text-black min-h-fit">
        <h3 className="text-lg font-bold">Transactions</h3>
        <a href="#" className="text-primary hover:underline">
          See All
        </a>
      </div>
      <div className="mt-3 space-y-3">
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-primary-light hover:bg-textPrimary p-4 rounded-lg shadow"
          >
            <div>
              <p className="text-sm font-medium">{transaction.transaction_type || "Unknown"}</p>
              <p className="text-xs text-gray-300">{transaction.created_at}</p>
            </div>
            <div className="text-right">
              <p
                className={`${
                  transaction.amount.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                } font-semibold`}
              >
                {transaction.amount}
              </p>
              <p className="text-xs text-gray-300">{transaction.transaction_type || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
