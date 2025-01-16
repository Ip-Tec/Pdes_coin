interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: number | string;
  };
  onSelect: (user: any) => void; // Callback for when a user is selected
}

const UserCard = ({ user, onSelect }: UserCardProps) => {
  return (
    <div
      onClick={() => onSelect(user)} // Handle click event
      className="p-4 bg-white border border-gray-300 rounded-lg shadow-md mb-4 hover:bg-gray-50 cursor-pointer"
    >
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="mt-2 text-sm">
        <span className="font-semibold">Role:</span> {user.role}
      </p>
    </div>
  );
};

export default UserCard;
