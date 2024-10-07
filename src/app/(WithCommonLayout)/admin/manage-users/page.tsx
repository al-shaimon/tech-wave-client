import React from "react";
import ManageUsersComponent from "@/app/(WithCommonLayout)/admin/manage-users/ManageUsersComponent";

export default function ManageUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Manage Users</h1>
      <ManageUsersComponent />
    </div>
  );
}
