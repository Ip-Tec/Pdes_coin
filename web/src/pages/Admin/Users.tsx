import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from API (replace with actual API call)
    setUsers([
      { id: 1, name: "John Doe", email: "john@example.com", referrals: 10 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", referrals: 5 },
      // More users...
    ]);
  }, []);

  return (
    <div className="users">
      <h2>Manage Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Referrals</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.referrals}</td>
              <td>
                <Link to={`/admin/users/${user.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
