import logo from "../assets/pdes.png";
import { useNavigate } from "react-router-dom";
import { formattedMoneyUSD } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

const BalanceCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddMoney = () => {
    navigate("/deposit");
  };

  return (
    <div className="bg-primary text-white rounded-2xl rounded-b-none p-4 shadow-md relative">
      <h2 className="text-2xl font-semibold">
        {formattedMoneyUSD(user?.balance || 0)}
      </h2>
      <div className="text-sm">
        <span className="font-semibold flex">
          <img src={logo} width={50} alt="PDES Logo" />
          <p className="text-xl mt-3">{user?.crypto_balance || 0}</p>
        </span>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm">{user?.full_name?.toUpperCase()}</p>
          <p className="text-sm">{user?.email}</p>
        </div>
        <div className="flex items-center m-4 bg-transparent absolute bottom-0 right-0">
          <button
            onClick={handleAddMoney}
            className="bg-secondary hover:bg-secondary-dark px-4 py-2 rounded-lg shadow-lg"
          >
            Deposit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
