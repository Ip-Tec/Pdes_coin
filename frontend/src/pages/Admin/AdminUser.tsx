import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import InputField from "../../components/InputField";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SlideInPanel from "../../components/Admin/SlideInPanel";
import { User } from "../../utils/type";
import { changePassword, getUsers, updateUser } from "../../services/adminAPI";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import SearchUsers from "../../components/Admin/SearchUsers";

const AdminUser: React.FC = () => {
  const { user } = useAuth();

  // Modal & editing states
  const [isModalOpen, setIsModalOpen] = useState(false); // For Edit Password modal
  const [isEditing, setIsEditing] = useState(false); // For editing user info
  const [password, setPassword] = useState<string>("");
  const [selectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>({
    id: 0,
    full_name: "",
    email: "",
    username: "",
    role: "",
    balance: 0,
    sticks: 0,
    reward: 0,
    is_blocked: false,
    created_at: "",
    referral_code: null,
    total_referrals: 0,
    referral_reward: 0,
    crypto_balance: 0,
  });
  // const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // State for paginated list with filter
  const [usersData, setUsersData] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");

  // Other states
  const [isDraggable, setIsDraggable] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);

  const roleHierarchy = [
    "USER",
    "SUPPORT",
    "MODERATOR",
    "ADMIN",
    "SUPER_ADMIN",
    "DEVELOPER",
    "OWNER",
  ];

  // Fetch paginated users whenever currentPage changes
  useEffect(() => {
    const getUsersAsync = async () => {
      try {
        const res = await getUsers(currentPage);
        // Expecting res: { users: User[], total_pages: number }
        setUsersData(res.users);
        setTotalPages(res.total_pages);
        console.log({ res });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getUsersAsync();
  }, [currentPage]);

  // Filter users by full_name, email, or role (case-insensitive)
  const filteredUsers = usersData.filter((user) => {
    if ("full_name" in user) {
      return [
        user.full_name,
        user.email,
        user.role,
        user.username,
        user.id,
        user.referral_code,
        user.last_reward_date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(filter.toLowerCase());
    }
    return false;
  });

  const userRoleIndex = roleHierarchy.indexOf(
    user?.role.toLocaleUpperCase() || "USER"
  );

  // Open the Edit User modal (for updating user info)
  const handleEditClick = (userItem: User) => {
    setEditingUser(userItem);
    setIsEditing(true);
  };

  // Close the edit user modal
  const closeEditModal = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  // Toggle support panel
  const handleSupportToggle = () => {
    setSupportVisible(!supportVisible);
  };

  // Submit edited user info
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await updateUser(editingUser);
      toast.success(response.message);
      setEditingUser(null);
      // Optionally, refresh the users list here
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error updating user");
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="w-full md:px-4 py-20 mb-6 overflow-x-clip text-gray-800">
        <h1 className="text-3xl font-bold mb-6"></h1>
        <SearchUsers
          title={"User Management"}
          setUsers={(users) => {
            if (
              (users as User[]).every(
                (user) =>
                  "role" in user &&
                  "email" in user &&
                  "full_name" in user &&
                  "username" in user
              )
            ) {
              setUsersData(users as User[]);
            } else {
              const transformedUsers = (users as User[]).map((user: User) => ({
                ...user,
                role: "", // default value for role
                email: "", // default value for email
                full_name: "", // default value for full_name
                username: "", // default value for username
                // Add other properties that are present in User but not in DepositPropsWithUser
              }));
              setUsersData(transformedUsers);
            }
          }}
        />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Filter Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by name, email, or role"
              className="w-full px-4 py-2 border bg-slate-300 border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {/* Users Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-300"
                >
                  <h2 className="text-xl font-bold mb-2">
                    {"full_name" in userItem && userItem.full_name}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    <strong>Email:</strong>{" "}
                    {"user" in userItem && userItem.email}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Role:</strong> {"role" in userItem && userItem.role}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Balance:</strong>{" "}
                    {"user" in userItem && userItem.balance}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Crypto:</strong>{" "}
                    {"crypto_balance" in userItem && userItem.crypto_balance}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Last Reward:</strong>{" "}
                    {"last_reward_date" in userItem &&
                      userItem.last_reward_date}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Total Referrals:</strong>{" "}
                    {"total_referrals" in userItem && userItem.total_referrals}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Referrer ID:</strong>{" "}
                    {"referrer_id" in userItem && userItem.referrer_id}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Status:</strong>{" "}
                    {"is_blocked" in userItem && userItem.is_blocked ? (
                      <span className="text-red-500 font-semibold">
                        Blocked
                      </span>
                    ) : (
                      <span className="text-green-500 font-semibold">
                        Active
                      </span>
                    )}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEditClick(userItem as User)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(userItem as User);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Edit Password
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center">No users found.</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Previous
            </button>
            <span>
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Selected User's Full Info (optional) */}
        {selectedUser && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 z-30">
            <h3 className="font-semibold text-lg mb-2">User Details</h3>
            <p>
              <strong>Name:</strong> {selectedUser.full_name}
            </p>
            <p className="text-gray-600 mb-1 break-words">
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Username:</strong> {selectedUser.username}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Balance:</strong> {selectedUser.balance}
            </p>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditing && editingUser && (
          <SlideInPanel title="Edit User Info" onClose={closeEditModal}>
            <form
              onSubmit={handleSubmitUser}
              className="flex flex-col justify-center items-center bg-white"
            >
              <div className="p-2 flex flex-col w-full m-auto space-y-4">
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  value={editingUser.full_name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      full_name: e.target.value,
                    })
                  }
                />

                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      email: e.target.value,
                    })
                  }
                />

                <div className="flex flex-col space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stick {user?.full_name}
                  </label>
                  <input
                    type="range"
                    name="stick"
                    min="0"
                    max="3"
                    step="1"
                    value={editingUser.sticks ?? "0"}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        sticks: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                  </div>
                </div>

                <InputField
                  label="Block User"
                  type="checkbox"
                  name="is_blocked"
                  checked={editingUser.is_blocked}
                  value={editingUser.is_blocked ? "true" : "false"}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      is_blocked: e.target.checked,
                    })
                  }
                />

                <label className="block mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value,
                    })
                  }
                  className="p-3 bg-slate-400 rounded-lg ml-4 text-textColor placeholder-gray-500 focus:outline-none focus:ring-0 focus:ring-transparent"
                >
                  {roleHierarchy
                    .filter(
                      (role) => roleHierarchy.indexOf(role) <= userRoleIndex
                    )
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-2 justify-between mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </SlideInPanel>
        )}

        {/* Edit Password Modal */}
        {isModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-80">
              <h2 className="text-lg font-bold mb-4">
                Change Password for {editingUser.full_name}
              </h2>
              <InputField
                type="password"
                name="password"
                label="Password"
                value={password}
                placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (editingUser) {
                    try {
                      await changePassword(editingUser, password);
                      toast.success("Password changed successfully!");
                      setIsModalOpen(false);
                      setPassword("");
                    } catch (error: unknown) {
                      if (error instanceof Error) {
                        toast.error(
                          `Failed to change password: ${error.message}`
                        );
                      } else {
                        toast.error("An unknown error occurred");
                      }
                    }
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-6 rounded-lg w-full"
              >
                Set Password
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-700 bg-gray-200 rounded-md mt-4 text-sm p-3 hover:bg-gray-300 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Draggable Support Panel */}
        {supportVisible && (
          <Draggable disabled={!isDraggable}>
            <div
              className={`fixed top-0 right-0 z-50 bg-white shadow-lg p-4 w-full md:w-1/2 h-full md:h-auto ${
                isDraggable ? "cursor-move" : ""
              }`}
            >
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="font-semibold text-xl">Support</h2>
                <div className="space-x-2">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded"
                    onClick={() => setIsDraggable(!isDraggable)}
                  >
                    {isDraggable ? "Lock" : "Drag"}
                  </button>
                  <button
                    className="text-red-500 font-bold"
                    onClick={handleSupportToggle}
                  >
                    Close
                  </button>
                </div>
              </div>
              {/* Top Users Needing Support */}
              <h3 className="font-semibold mb-2">Top Users Needing Support</h3>
              <ul className="space-y-2">
                <li className="bg-gray-100 p-3 rounded-lg shadow">
                  <strong>John Doe</strong>
                  <p className="text-sm text-gray-600">
                    "I need help with my balance."
                  </p>
                  <button className="mt-2 text-blue-500">Reply</button>
                </li>
              </ul>
            </div>
          </Draggable>
        )}
      </div>
    </AdminWrapper>
  );
};

export default AdminUser;
