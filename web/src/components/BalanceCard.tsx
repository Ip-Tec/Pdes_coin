const BalanceCard = () => {
  return (
    <div className="bg-primary text-white rounded-2xl p-4 shadow-md relative">
      <h2 className="text-xl font-semibold">$16,567.00</h2>
      <p className="text-sm">+3.5% from last month</p>
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm">Number: **** 1214</p>
          <p className="text-sm">Exp: 02/15</p>
        </div>
        <div className="flex items-center m-4 bg-transparent absolute bottom-0 right-0">
          <button className="bg-secondary hover:bg-secondary-dark px-4 py-2 rounded-lg shadow-lg">
            Add Money
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
