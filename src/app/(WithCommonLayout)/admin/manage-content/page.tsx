import React from "react";
import ManageContentComponent from "@/app/(WithCommonLayout)/admin/manage-content/ManageContentComponent";

export default function ManageContentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Manage Content</h1>
      <ManageContentComponent />
    </div>
  );
}
