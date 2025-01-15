import { Link } from "react-router-dom";
import {
  FaUser,
  FaCoins,
  FaExchangeAlt,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Pdes Coin</h2>
      </div>
      <ul className="menu">
        <li>
          <Link to="/admin/dashboard">
            <FaChartLine />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/users">
            <FaUser />
            Manage Users
          </Link>
        </li>
        <li>
          <Link to="/admin/transactions">
            <FaExchangeAlt />
            Transactions
          </Link>
        </li>
        <li>
          <Link to="/admin/referrals">
            <FaCoins />
            Referrals
          </Link>
        </li>
        <li>
          <Link to="/admin/settings">
            <FaSignOutAlt />
            Settings
          </Link>
        </li>
        <li>
          <Link to="/admin/utility">
            <FaSignOutAlt />
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
