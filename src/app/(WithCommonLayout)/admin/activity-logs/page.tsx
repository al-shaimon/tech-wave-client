import ActivityLogsComponent from "@/app/(WithCommonLayout)/admin/activity-logs/ActivityLogsComponent";
import React from "react";

export default function ActivityLogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">User Activity Logs</h1>
      <ActivityLogsComponent />
    </div>
  );
}
