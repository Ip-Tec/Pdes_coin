import { useState } from "react";
import { searchUser } from "../../services/adminAPI";
import { toast } from "react-toastify";
import { User } from "../../utils/type";

// Destructure the props correctly in the function argument
const SearchUsers = ({ title, setUsers }: { title: string; setUsers: React.Dispatch<React.SetStateAction<User[]>> }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    try {
      const response = await searchUser(searchQuery);
      if (response && response.length > 0) {
        setUsers(response);
      } else {
        setUsers([]);
        toast.error("No users found");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
      setUsers([]);
    }
  };

  return (
    <div className="mb-6 fixed m-auto w-[50%] top-20 left-[30%] z-10">
      <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">
        {title || "Search Users"}
      </h1>
      <input
        type="text"
        placeholder="Search for user..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
        bg-slate-300 text-textColor placeholder-gray-500 shadow-[#b9b9b9] 
        shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
      
      />
    </div>
  );
};

export default SearchUsers;
