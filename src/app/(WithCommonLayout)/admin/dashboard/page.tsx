"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import Link from "next/link";
import Image from "next/image";
import SkeletonLoader from "@/components/SkeletonLoader";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  posts: string[];
}

interface Post {
  _id: string;
  isPaid: boolean;
}

interface ActivityLog {
  _id: string;
  user: {
    name: string;
    role: string;
  };
  action: string;
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalPremiumUsers: number;
  totalPremiumPosts: number;
  recentActivities: ActivityLog[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalPremiumUsers: 0,
    totalPremiumPosts: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `${token}` };

      // Fetch users
      const usersResponse = await axios.get(`${envConfig.baseApi}/auth/users`, {
        headers,
      });
      const users: User[] = usersResponse.data.data.users;
      const totalUsers = users.length;
      const totalPremiumUsers = users.filter((user) => user.isVerified).length;

      // Fetch posts
      const postsResponse = await axios.get(`${envConfig.baseApi}/posts`, {
        headers,
      });
      const posts: Post[] = postsResponse.data.data;
      const totalPosts = posts.length;
      const totalPremiumPosts = posts.filter((post) => post.isPaid).length;

      // Fetch recent activities
      const activitiesResponse = await axios.get(
        `${envConfig.baseApi}/activity-logs`,
        { headers },
      );
      const recentActivities = activitiesResponse.data.data.slice(0, 5); // Get only the 5 most recent activities

      setStats({
        totalUsers,
        totalPosts,
        totalPremiumUsers,
        totalPremiumPosts,
        recentActivities,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard statistics");
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "/manage-users.svg",
      link: "/admin/manage-users",
      color: "bg-blue-500",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: "/posts.svg",
      link: "/admin/manage-content",
      color: "bg-green-500",
    },
    {
      title: "Premium Users",
      value: stats.totalPremiumUsers,
      icon: "/premium.svg",
      link: "/admin/manage-users",
      color: "bg-purple-500",
    },
    {
      title: "Premium Posts",
      value: stats.totalPremiumPosts,
      icon: "/premium-posts.svg",
      link: "/admin/manage-content",
      color: "bg-yellow-500",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Link
            href={stat.link}
            key={index}
            className="transform rounded-lg bg-base-200 p-6 shadow-lg transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.color}`}>
                <Image
                  src={stat.icon}
                  width={24}
                  height={24}
                  alt={stat.title}
                  className="brightness-0 invert"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-base-200 p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between rounded-lg bg-base-100 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{activity.user.name}</p>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {activity.user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/admin/activity-logs"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          View All Activity →
        </Link>
      </div>
    </div>
  );
}
