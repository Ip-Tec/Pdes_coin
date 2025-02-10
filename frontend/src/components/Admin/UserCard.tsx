import { User, DepositPropsWithUser } from "../../utils/type";

// Define the UserCardProps interface
interface UserCardProps {
  user: User | DepositPropsWithUser;
  onSelect: (user: User | DepositPropsWithUser) => void;
}

const UserCard = ({ user, onSelect }: UserCardProps) => {
  console.log({ user });

  // Check if 'user' is a User object (it will have the 'full_name' property directly)
  // if ("full_name" in user) {
  //   console.log("user", user);
  //   return (
  //     <div
  //       onClick={() => onSelect(user)} // Handle click event
  //       className="p-4 bg-white border border-gray-300 rounded-lg shadow-md mb-4 hover:bg-gray-50 cursor-pointer"
  //     >
  //       <h3 className="text-lg font-semibold">{user.full_name}</h3>
  //       <p className="text-sm text-gray-500">
  //         <strong>Email: </strong>
  //         {user.email}
  //       </p>
  //       <p className="text-sm text-gray-500">
  //         <strong>Balance: </strong>
  //         {user.balance}
  //       </p>
  //       <p className="text-sm text-gray-500">
  //         <strong>Crypto Balance: </strong> {user.crypto_balance}
  //       </p>
  //       <p className="text-sm text-gray-500">
  //         Join: {new Date(user.created_at).toLocaleString()}
  //       </p>
  //       <p className="mt-2 text-sm">
  //         <span className="font-semibold">Role:</span> {user.role}
  //       </p>
  //     </div>
  //   );
  // }

  // Check if 'user' is a Deposit object (it will have the 'user' field containing the User object)
  if ("user" in user) {
    return (
      <div
        onClick={() => onSelect(user)}
        className={`p-4 bg-white border border-gray-300 rounded-lg 
        shadow-md mb-4 hover:bg-gray-50 cursor-pointer ${
          user.status == "completed" && "rounded-b-none border-b-8 border-green-500"
        }`}
      >
        <h3 className="text-lg font-semibold">{user.user.full_name}</h3>
        <p className="text-sm text-gray-500">
          <strong>Email: </strong>
          {user.user.email}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Balance: </strong>
          {user.user.balance}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Crypto Balance: </strong> {user.user.crypto_balance}
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Join:</span>{" "}
          {new Date(user.user.created_at).toLocaleString()}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold">Role:</span> {user.user.role}
        </p>
        {user.status && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">Sattus:</span> {user.status}
          </p>
        )}
      </div>
    );
  }

  return null; // Return null if neither condition is met (though ideally, you won't reach this point)
};

export default UserCard;
