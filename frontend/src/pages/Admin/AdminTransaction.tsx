import { useState } from "react";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SearchUsers from "../../components/Admin/SearchUsers";
import UserCard from "../../components/Admin/UserCard";
import AddDepositAccount from "../../components/Admin/AddDepositAccount";
import ConfirmTransaction from "../../components/Admin/ConfirmTransaction";
import BulkUpdateTransactions from "../../components/Admin/BulkUpdateTransactions";
import DownloadComponent from "../../components/Admin/DownloadComponent";
import SlideInPanel from "../../components/Admin/SlideInPanel"; // Reusable slide-in panel
import { DepositPropsWithUser, User } from "../../utils/type";
import { ToastContainer, toast } from "react-toastify";
import ChartWithToggle from "../../components/Admin/ChartWithToggle";
import { giveRewardsToUsers } from "../../services/adminAPI";
import { useAuth } from "../../contexts/AuthContext";
import { formattedMoneyUSD } from "../../utils/helpers";

const AdminTransaction = () => {
  const [users, setUsers] = useState<User[] | DepositPropsWithUser[]>([]);
  const [activeComponent, setActiveComponent] = useState<
    string | DepositPropsWithUser | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<
    User | DepositPropsWithUser | null
  >(null);
  const [searchType, setSearchType] = useState("");
  const [isGivingRewards, setIsGivingRewards] = useState(false);
  const { user } = useAuth();

  // console.log({ selectedUser });

  const navigationItems = [
    { label: "Confirm Deposit", component: "ConfirmTransaction" },
    { label: "Add Account", component: "AddDepositAccount" },
    { label: "Bulk Update", component: "BulkUpdateTransactions" },
    { label: "Download Transactions", component: "DownloadComponent" },
  ];

  const handleSelectUser = (user: DepositPropsWithUser | User) => {
    if ("user" in user) {
      setSelectedUser(user as DepositPropsWithUser);
    } else {
      setSelectedUser(user as User);
    }

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
            <ConfirmTransaction user={selectedUser ?? undefined} />
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
      case "DownloadComponent":
        return (
          <SlideInPanel
            title="Download Filter"
            onClose={() => setActiveComponent(null)}
          >
            <DownloadComponent />
          </SlideInPanel>
        );
      case "EditTransaction":
        return selectedUser ? (
          searchType == "deposits" ? (
            <SlideInPanel
              title="Edit Confirm Transaction"
              onClose={() => setActiveComponent(null)}
            >
              <ConfirmTransaction user={selectedUser} />
            </SlideInPanel>
          ) : (
            <SlideInPanel
              title={`Edit Transaction for ${
                "full_name" in selectedUser && selectedUser.full_name
              }`}
              onClose={() => setActiveComponent(null)}
            >
              {/* You can add transaction editing functionality here */}
              <div>
                Transaction details for{" "}
                {"full_name" in selectedUser && selectedUser.full_name}
              </div>
            </SlideInPanel>
          )
        ) : null;
      default:
        return null;
    }
  };

  const handleGiveRewards = async () => {
    if (
      !confirm(
        "Are you sure you want to distribute rewards to all eligible users?"
      )
    ) {
      return;
    }

    setIsGivingRewards(true);
    try {
      const result = await giveRewardsToUsers();

      toast.success(
        `Successfully distributed rewards to ${
          result.rewarded_users.length
        } users. Total rewards: ${formattedMoneyUSD(result.total_rewards)}`
      );

      // Optionally refresh transaction list if needed
      // fetchTransactions();
    } catch (error) {
      console.error("Error giving rewards:", error);
      toast.error("Failed to distribute rewards. Please try again.");
    } finally {
      setIsGivingRewards(false);
    }
  };

  const canGiveRewards =
    user && ["SUPER_ADMIN", "DEVELOPER", "OWNER"].includes(user.role);

  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="my-10 text-gray-600 mx-auto md:px-6">
        {/* Search Bar */}
        <SearchUsers
          title="Admin Transaction"
          setUsers={setUsers}
          setParentSearchType={setSearchType}
          //  Dynamic Navigation
          component={
            <div className="w-full overflow-hidden mt-10">
              <ul className="w-full flex justify-center p-2 overflow-x-scroll no-scrollbar mb-8">
                {navigationItems.map((item) => (
                  <li
                    key={item.label}
                    className={`bg-bgColor text-sm text-center py-2 no-underline hover:no-underline focus:no-underline px-4 hover:text-secondary hover:bg-transparent border hover:border-secondary rounded-full relative cursor-pointer transition duration-300 ${
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
            </div>
          }
        />

        {/* Add the Give Rewards button */}
        {canGiveRewards && (
          <div className="mb-4">
            <button
              onClick={handleGiveRewards}
              disabled={isGivingRewards}
              className={`px-4 py-2 rounded-md ${
                isGivingRewards
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isGivingRewards ? (
                <>
                  <span className="animate-pulse">Processing Rewards...</span>
                </>
              ) : (
                "Give Rewards to Users"
              )}
            </button>
          </div>
        )}

        {/* Render Active Component */}
        {renderActiveComponent()}

        {/* User Cards */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onSelect={handleSelectUser} />
          ))}
        </div>
        <div className="w-full">
          <ChartWithToggle />
        </div>
      </div>
    </AdminWrapper>
  );
};

export default AdminTransaction;
