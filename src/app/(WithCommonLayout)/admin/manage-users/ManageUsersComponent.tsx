"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isDeleted: boolean;
}

export default function ManageUsersComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${envConfig.baseApi}/auth/admin/users`,
        {
          headers: { Authorization: `${token}` },
        },
      );
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string) => {
    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      let successMessage = "";

      switch (action) {
        case "delete":
          endpoint = `${envConfig.baseApi}/auth/admin/users/${userId}/delete`;
          successMessage = "User deleted successfully";
          break;
        case "block":
          endpoint = `${envConfig.baseApi}/auth/admin/users/${userId}/block`;
          successMessage = "User blocked successfully";
          break;
        case "unblock":
          endpoint = `${envConfig.baseApi}/auth/admin/users/${userId}/unblock`;
          successMessage = "User unblocked successfully";
          break;
        case "makeAdmin":
          endpoint = `${envConfig.baseApi}/auth/admin/users/${userId}/make-admin`;
          successMessage = "User promoted to admin successfully";
          break;
        case "demote":
          endpoint = `${envConfig.baseApi}/auth/admin/users/${userId}/demote`;
          successMessage = "Admin demoted to user successfully";
          break;
        default:
          throw new Error("Invalid action");
      }

      const response = await axios.put(
        endpoint,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );

      if (response.data.success) {
        toast.success(successMessage);
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error(`Error performing action:`, error);
      toast.error("Failed to perform action");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  onClick={() => handleAction(user._id, "delete")}
                  className="btn btn-error btn-xs mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    handleAction(user._id, user.isBlocked ? "unblock" : "block")
                  }
                  className={`btn btn-xs mr-2 ${user.isBlocked ? "btn-success" : "btn-warning"}`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
                {user.role === "user" ? (
                  <button
                    onClick={() => handleAction(user._id, "makeAdmin")}
                    className="btn btn-info btn-xs"
                  >
                    Make Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(user._id, "demote")}
                    className="btn btn-secondary btn-xs"
                  >
                    Demote to User
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
