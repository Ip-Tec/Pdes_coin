import React, { useState } from "react";
import Draggable from "react-draggable";
import InputField from "../../components/InputField";
import { useAuth } from "../../contexts/AuthContext";
import SearchUsers from "../../components/Admin/SearchUsers";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SlideInPanel from "../../components/Admin/SlideInPanel";
import { DepositPropsWithUser, User } from "../../utils/type";
import { changePassword, updateUser } from "../../services/adminAPI";
import { toast, ToastContainer } from "react-toastify";

const AdminUser: React.FC = () => {
  const { user,  isAllowed } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState<string>();
  // selectedUser is kept for potential future use
  const [selectedUser] = useState<User | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>({
    id: 0,
    full_name: "",
    email: "",
    username: "",
    role: "",
    balance: 0,
    sticks: 0,
    is_blocked: false,
    created_at: "",
    referral_code: null,
    total_referrals: 0,
    referral_reward: 0,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[] | DepositPropsWithUser[]>([]);
  // const allowedRoles = ["ADMIN", "SUPER_ADMIN", "DEVELOPER", "OWNER"];
  const roleHierarchy = [
    "USER",
    "SUPPORT",
    "MODERATOR",
    "ADMIN",
    "SUPER_ADMIN",
    "DEVELOPER",
    "OWNER",
  ];

  const userRoleIndex = roleHierarchy.indexOf(
    user?.role.toLocaleUpperCase() || "USER"
  );
  // console.log({ allowedRoles, userRoleIndex, roles, user, users });

  // Open edit modal
  const handleEditClick = (userItem: User | DepositPropsWithUser) => {
    if ("full_name" in userItem) {
      setEditingUser(userItem);
    } else {
      setEditingUser(userItem.user);
    }
    setIsEditing(true);
  };

  // Toggle accordion for user details
  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Close the modal
  const closeEditModal = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  // Toggle support panel
  const handleSupportToggle = () => {
    setSupportVisible(!supportVisible);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // console.log("Sending updated user data:", editingUser);

    try {
      // Call your API to update the user with the updated info
      const response = await updateUser(editingUser);
      toast.success(response.message);
      setEditingUser(null);

      // Optionally, refresh your users list or show a success message here
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
      <div className="w-wull md:px-4 py-20 mb-6 overflow-x-clip">
        {/* Search Bar with Suggestions */}
        <SearchUsers title="Admin User Page" setUsers={setUsers} />

        {/* Floating Search Results */}
        {users.length > 0 && (
          <div className="my-24 w-auto flex flex-wrap gap-2 text-gray-600 mx-auto px-6">
            {users.map(
              (userItem: User | DepositPropsWithUser, index: number) => {
                // Extract user data whether it's a direct User or wrapped in DepositPropsWithUser
                const userData =
                  "full_name" in userItem ? userItem : userItem.user;
                return (
                  <div
                    key={userData.id}
                    className="cursor-pointer mb-4 p-4 border rounded-lg shadow bg-gray-50 hover:bg-gray-100"
                  >
                    <div onClick={() => toggleAccordion(index)}>
                      <p>
                        <strong>Name:</strong> {userData.full_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {userData.email}
                      </p>
                      <p>
                        <strong>Username:</strong> {userData.username}
                      </p>
                      <p>
                        <strong>Role:</strong> {userData.role}
                      </p>
                      <p>
                        <strong>Sticks:</strong> {userData.sticks}
                      </p>
                      <p>
                        <strong>Is Blocked:</strong> {userData.is_blocked}
                      </p>
                      <p>
                        <strong>Balance:</strong> {userData.balance}
                      </p>
                    </div>

                    {/* Accordion Content */}
                    {/* Check if user has access to edit user */}
                    <div className="flex justify-between gap-1 bg-primary-light m-2 w-full rounded-lg">
                      {activeIndex === index &&
                        isAllowed(user?.role as string) && (
                          <button
                            onClick={() => handleEditClick(userItem)}
                            className="m-2 text-white"
                          >
                            Edit User
                          </button>
                        )}
                      <div>
                        <button
                          onClick={() => {
                            setEditingUser(userData); // Store selected user
                            setIsModalOpen(true); // Open modal
                          }}
                          className="m-2 text-white"
                        >
                          Edit Password
                        </button>
                      </div>
                    </div>
                    {/* Change Password Modal */}
                    {isModalOpen && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-6 shadow-lg w-80">
                          <h2 className="text-lg font-bold mb-4">
                            Change Password for {editingUser?.full_name}
                          </h2>

                          <InputField
                            type="text"
                            name="Password"
                            label={"Password"}
                            value={password ?? ""}
                            placeholder="Enter new password"
                            onChange={(e) => setPassword(e.target.value)}
                          />

                          <button
                            onClick={async () => {
                              if (editingUser) {
                                try {
                                  await changePassword(editingUser, password!);
                                  setIsModalOpen(false); // Close modal
                                  setPassword(""); // Clear input
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
                            className="bg-bgColor hover:bg-secondary text-white px-4 py-2 mt-6 rounded-lg w-full"
                          >
                            Set Password
                          </button>
                          <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-100 rounded-md bg-secondary-dark mt-4 text-sm p-3 hover:bg-bgColor hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Selected User's Full Info */}
        {selectedUser && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 z-30">
            <h3 className="font-semibold text-lg mb-2">User Details</h3>
            <p>
              <strong>Name:</strong> {selectedUser.full_name}
            </p>
            <p>
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
                  className="p-3 bg-slate-400 rounded-lg ml-4 text-textColor placeholder-gray-500 
                             focus:outline-none focus:ring-0 focus:ring-transparent"
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
