import { ReactNode, useState } from "react";
import { searchUser } from "../../services/adminAPI"; // Adjust based on your API calls
import { toast } from "react-toastify";
import { DepositPropsWithUser, User } from "../../utils/type";

const SearchUsers = ({
  title,
  setUsers,
  component,
  setParentSearchType, // prop to update parent searchType
}: {
  title: string;
  // To be passed to the UserCard component
  setUsers: React.Dispatch<React.SetStateAction<User[] | DepositPropsWithUser[]>>;

  component?: ReactNode;
  setParentSearchType?: React.Dispatch<React.SetStateAction<string>>; // Optional prop
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("user");

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    try {
      let response;
      if (e.target.value.trim() === "") {
        setUsers([]); // If search query is empty, reset users
        return;
      }

      // Handle different search types
      if (searchType === "user") {
        response = await searchUser(e.target.value, "search");
      } else if (searchType === "transaction") {
        response = await searchUser(e.target.value, "transaction");
      } else if (searchType === "crypto") {
        response = await searchUser(e.target.value, "crypto");
      } else if (searchType === "deposits") {
        response = await searchUser(e.target.value, "deposits");
      }

      // console.log({ response, searchQuery, searchType });

      if (response && response.length > 0) {
        setUsers(response);
      } else {
        setUsers([]);
        toast.error("No results found");
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

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSearchType = e.target.value;
    setSearchType(newSearchType);
    if (setParentSearchType) {
      setParentSearchType(newSearchType); // Update parent state if prop is provided
    }
  };

  return (
    <div className="mb-6 contents items-center justify-evenly fixed m-auto w-[80%] md:w-[50%] top-20 left-[30%] z-10">
      <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">
        {title || "Search Users or Transactions"}
      </h1>
      <div className="flex w-full shadow-md justify-between bg-slate-300 mb-4 border-[#D9D9D9] rounded-3xl">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-2/3 md:w-3/4 px-4 py-2 border-none bg-transparent text-textColor placeholder-gray-500
           shadow-[#b9b9b9] focus:outline-none focus:ring-0 focus:ring-transparent"
        />
        <select
          value={searchType}
          onChange={handleSearchTypeChange}
          className="p-3 w-2/3 md:w-3/4 bg-transparent rounded-lg ml-4 text-textColor placeholder-gray-500 
          focus:outline-none focus:ring-0 focus:ring-transparent mr-2"
        >
          <option value="user">User</option>
          <option value="crypto">Crypto</option>
          <option value="transaction">Transaction</option>
          <option value="deposits">User Deposits</option>
        </select>
      </div>
      <div className="flex justify-center mt-8 container">{component && component}</div>
    </div>
  );
};

export default SearchUsers;
