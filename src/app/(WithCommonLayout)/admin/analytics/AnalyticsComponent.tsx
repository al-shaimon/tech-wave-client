/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface AnalyticsData {
  monthlyPayments: number[];
  monthlyPosts: number[];
  monthlyVotes: number[];
  monthlyComments: number[];
}

export default function AnalyticsComponent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [paymentsResponse, postsResponse] = await Promise.all([
        axios.get(`${envConfig.baseApi}/payments`, {
          headers: { Authorization: `${token}` },
        }),
        axios.get(`${envConfig.baseApi}/posts`, {
          headers: { Authorization: `${token}` },
        }),
      ]);

      const payments = paymentsResponse.data.data;
      const posts = postsResponse.data.data;

      const analyticsData = processData(payments, posts);
      setAnalyticsData(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load analytics data.");
      setLoading(false);
    }
  };

  const processData = (payments: any[], posts: any[]) => {
    const monthlyData = Array(12)
      .fill(0)
      .map(() => ({
        payments: 0,
        posts: 0,
        votes: 0,
        comments: 0,
      }));

    payments.forEach((payment) => {
      const month = new Date(payment.createdAt).getMonth();
      monthlyData[month].payments += payment.amount;
    });

    posts.forEach((post) => {
      const month = new Date(post.createdAt).getMonth();
      monthlyData[month].posts += 1;
      monthlyData[month].votes += post.votes || 0;
      monthlyData[month].comments += post.comments?.length || 0;
    });

    return {
      monthlyPayments: monthlyData.map((data) => data.payments),
      monthlyPosts: monthlyData.map((data) => data.posts),
      monthlyVotes: monthlyData.map((data) => data.votes),
      monthlyComments: monthlyData.map((data) => data.comments),
    };
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const paymentsData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Payments",
        data: analyticsData?.monthlyPayments || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const postsData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Posts",
        data: analyticsData?.monthlyPosts || [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const userActivityData = {
    labels: months,
    datasets: [
      {
        label: "Votes",
        data: analyticsData?.monthlyVotes || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
      {
        label: "Comments",
        data: analyticsData?.monthlyComments || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Analytics",
      },
    },
  };

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Monthly Payments</h2>
        <Bar data={paymentsData} options={options} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Monthly Posts</h2>
        <Bar data={postsData} options={options} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">User Activity</h2>
        <Line data={userActivityData} options={options} />
      </div>
    </div>
  );
}
