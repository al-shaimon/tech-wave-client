/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SkeletonLoader from "@/components/SkeletonLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface AnalyticsModalProps {
  onClose: () => void;
  posts: any[];
  userId: string;
}

export default function AnalyticsModal({
  onClose,
  posts,
  userId,
}: AnalyticsModalProps) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const commentCounts = posts.reduce(
      (sum, post) => sum + (post.comments?.length || 0),
      0,
    );
    const reactionCounts = posts.reduce(
      (sum, post) => sum + (post.votes || 0),
      0,
    );

    // Generate or retrieve persistent view and share counts
    const storageKey = `user_${userId}_analytics`;
    const storedData = localStorage.getItem(storageKey);
    let viewCounts, shareCounts;

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      viewCounts = parsedData.viewCounts;
      shareCounts = parsedData.shareCounts;
    } else {
      const generateRandomCount = (base: number) =>
        Math.floor(base * (1 + Math.random()));
      viewCounts = generateRandomCount(commentCounts + reactionCounts);
      shareCounts = generateRandomCount(
        Math.floor((commentCounts + reactionCounts) / 2),
      );

      // Store the generated counts
      localStorage.setItem(
        storageKey,
        JSON.stringify({ viewCounts, shareCounts }),
      );
    }

    const data = {
      labels: ["Shares", "Reactions", "Comments", "Views"],
      datasets: [
        {
          label: "Content Analytics",
          data: [shareCounts, reactionCounts, commentCounts, viewCounts],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    console.log("Chart data:", data);
    setChartData(data);
  }, [posts, userId]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Content Analytics",
      },
    },
  };

  if (!chartData) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl rounded-lg bg-base-300 p-6">
        <h2 className="mb-4 text-center text-2xl font-bold">
          Content Analytics
        </h2>
        {chartData.datasets[0].data.every((value: number) => value === 0) ? (
          <p>No data available for analytics.</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
        <button
          onClick={onClose}
          className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
