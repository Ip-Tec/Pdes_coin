import { useState } from "react";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SearchUsers from "../../components/Admin/SearchUsers";
import UserCard from "../../components/Admin/UserCard";
import AddDepositAccount from "../../components/Admin/AddDepositAccount";
import ConfirmTransaction from "../../components/Admin/ConfirmTransaction";
import BulkUpdateTransactions from "../../components/Admin/BulkUpdateTransactions";
import SlideInPanel from "../../components/Admin/SlideInPanel"; // Reusable slide-in panel
import { User } from "../../utils/type";
import { ToastContainer } from "react-toastify";

const AdminTransaction = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const navigationItems = [
    { label: "Confirm Deposit", component: "ConfirmTransaction" },
    { label: "Add Account", component: "AddDepositAccount" },
    { label: "Bulk Update", component: "BulkUpdateTransactions" },
  ];

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    console.log("the Selected User", user.full_name);
    
    setActiveComponent("EditTransaction");
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "ConfirmTransaction":
        return (
          <SlideInPanel
            title="Edit Confirm Transaction"
            onClose={() => setActiveComponent(null)}
          >
            <ConfirmTransaction user={selectedUser} />
          </SlideInPanel>
        );
      case "AddDepositAccount":
        return (
          <SlideInPanel
            title="Edit Add Deposit Account"
            onClose={() => setActiveComponent(null)}
          >
            <AddDepositAccount />
          </SlideInPanel>
        );
      case "BulkUpdateTransactions":
        return (
          <SlideInPanel
            title="Edit Bulk Update Transactions"
            onClose={() => setActiveComponent(null)}
          >
            <BulkUpdateTransactions />
          </SlideInPanel>
        );
      case "EditTransaction":
        return selectedUser ? (
          <SlideInPanel
            title={`Edit Transaction for ${selectedUser.full_name}`}
            onClose={() => setActiveComponent(null)}
          >
            {/* You can add transaction editing functionality here */}
            <div>Transaction details for {selectedUser.full_name}</div>
          </SlideInPanel>
        ) : null;
      default:
        return null;
    }
  };
  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="my-16 max-w-4xl text-gray-600 mx-auto px-6">
        {/* Search Bar */}
        <SearchUsers
          title="Admin Transaction"
          setUsers={setUsers}
          //  Dynamic Navigation
          component={
            <ul className="flex justify-center space-x-4 mb-8">
              {navigationItems.map((item) => (
                <li
                  key={item.label}
                  className={`bg-bgColor text-sm py-2 no-underline hover:no-underline focus:no-underline px-4 hover:text-secondary hover:bg-transparent border hover:border-secondary rounded-full relative cursor-pointer transition duration-300 ${
                    activeComponent === item.component
                      ? "font-bold text-blue-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-transparent"
                      : "text-gray-300 hover:after:content-[''] hover:after:absolute hover:after:bottom-[-2px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-transparent hover:text-secondary"
                  }`}
                  onClick={() => setActiveComponent(item.component)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          }
        />

        {/* Render Active Component */}
        {renderActiveComponent()}

        {/* User Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onSelect={handleSelectUser} />
          ))}
        </div>
      </div>
    </AdminWrapper>
  );
};

export default AdminTransaction;
