"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { format } from "date-fns";
import SkeletonLoader from "@/components/SkeletonLoader";

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  timestamp: string;
}

export default function ActivityLogsComponent() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${envConfig.baseApi}/activity-logs`, {
        headers: { Authorization: `${token}` },
      });
      setActivityLogs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {activityLogs.map((log) => (
            <tr key={log._id}>
              <td>{log.user.name}</td>
              <td>{log.user.email}</td>
              <td>{log.user.role}</td>
              <td>{log.action}</td>
              <td>{format(new Date(log.timestamp), "PPpp")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
