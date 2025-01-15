import { FaUserCircle, FaBell } from "react-icons/fa";

const AdminTopbar = () => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>Pdes Coin Admin</h2>
      </div>
      <div className="topbar-right">
        <div className="notifications">
          <FaBell />
        </div>
        <div className="user-profile">
          <FaUserCircle />
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
