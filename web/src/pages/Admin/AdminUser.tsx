import React, { useState } from "react";
import { DepositPropsWithUser, User } from "../../utils/type";
import Draggable from "react-draggable";
import InputField from "../../components/InputField";
import SearchUsers from "../../components/Admin/SearchUsers";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SlideInPanel from "../../components/Admin/SlideInPanel";

const AdminUser: React.FC = () => {
  const [users, setUsers] = useState<User[] | DepositPropsWithUser[]>([]);
  const [selectedUser] = useState<User | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [supportVisible, setSupportVisible] = useState(false);

  // Open edit modal
  const handleEditClick = (user: User | DepositPropsWithUser) => {
    if ("full_name" in user) {
      setEditingUser(user);
    } else {
      setEditingUser(user.user);
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

  return (
    <AdminWrapper>
      <div className="p-4 md:p-8 min-h-screen my-16 text-gray-800 relative">
        {/* Search Bar with Suggestions */}
        <SearchUsers title="Admin User Page" setUsers={setUsers} />

        {/* Floating Search Results */}
        {users.length > 0 && (
          <div className="my-24 w-auto text-gray-600 mx-auto px-6">
            {users.map((user: User | DepositPropsWithUser, index: number) => (
              <div
                key={user.id}
                className="cursor-pointer mb-4 p-4 border rounded-lg shadow bg-gray-50 hover:bg-gray-100"
              >
                <div onClick={() => toggleAccordion(index)}>
                  <p>
                    <strong>Name:</strong>{" "}
                    {"full_name" in user ? user.full_name : user.user.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {"email" in user ? user.email : user.user.email}
                  </p>
                  <p>
                    <strong>Username:</strong>{" "}
                    {"username" in user ? user.username : user.user.username}
                  </p>
                  <p>
                    <strong>Role:</strong>{" "}
                    {"role" in user ? user.role : user.user.role}
                  </p>
                  <p>
                    <strong>Balance:</strong>{" "}
                    {"balance" in user ? user.balance : user.user.balance}
                  </p>
                </div>

                {/* Accordion Content */}
                {activeIndex === index && (
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="mt-2 text-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
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
          <SlideInPanel
            title="Edit User Info"
            onClose={closeEditModal}
            children={
              <div className="flex flex-col justify-center items-center bg-white">
                <div className="p-2 flex flex-col w-full m-auto">
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
                    type="Email"
                    name="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                  />
                  <label className="block mb-1">Role</label>
                  <select
                    className="p-3 bg-slate-400 rounded-lg ml-4 text-textColor placeholder-gray-500 
          focus:outline-none focus:ring-0 focus:ring-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                    <option value="developer">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={closeEditModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    Save Changes
                  </button>
                </div>
              </div>
            }
          />
        )}

        {/* Draggable Support Panel */}
        {supportVisible && (
          <Draggable disabled={!isDraggable}>
            <div
              className={`fixed top-0 ${
                isDraggable ? "cursor-move" : ""
              } bg-white shadow-lg p-4 w-full md:w-1/2 h-full md:h-auto right-0 z-50`}
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
