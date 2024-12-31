

const TransactionList = () => {
  const transactions = [
    { type: "Top up", amount: "+$100.00", time: "Today 1:53 PM", mode: "Deposit" },
    { type: "Transfer", amount: "-$50.00", time: "Today 2:33 PM", mode: "Send" },
    { type: "Received", amount: "+$50.00", time: "Today 3:32 PM", mode: "Deposit" },
    { type: "Top up", amount: "+$20.00", time: "Jan 15, 5:15 AM", mode: "Deposit" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mt-6 text-black">
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
              <p className="text-sm font-medium">{transaction.type}</p>
              <p className="text-xs text-gray-300">{transaction.time}</p>
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
              <p className="text-xs text-gray-300">{transaction.mode}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
