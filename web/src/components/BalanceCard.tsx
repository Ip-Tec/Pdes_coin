import { User } from "../utils/type";
import logo from "../assets/pdes.png";
import { useNavigate } from "react-router-dom";
import { formattedMoneyUSD } from "../utils/helpers";
const BalanceCard = ({ balance, crypto_balance, full_name, email }: User) => {
  const navigate = useNavigate();

  const handelAddMoney = () => {
    navigate("/deposit");
  };
  return (
    <div className="bg-primary text-white rounded-2xl p-4 shadow-md relative">
      <h2 className="text-2xl font-semibold">${formattedMoneyUSD(balance)}</h2>
      <div className="text-sm">
        <span className="font-semibold flex">
          <img src={logo} width={50} />
          <p className="text-xl mt-3">{crypto_balance}</p>
        </span>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm">{full_name.toUpperCase()}</p>
          <p className="text-sm">{email}</p>
        </div>
        <div className="flex items-center m-4 bg-transparent absolute bottom-0 right-0">
          <button
            onClick={handelAddMoney}
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
