"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const adminNavItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: "/dashboard.svg",
  },
  {
    name: "Manage Users",
    path: "/admin/manage-users",
    icon: "/manage-users.svg",
  },
  {
    name: "Manage Content",
    path: "/admin/manage-content",
    icon: "/manage-posts.svg",
  },
  {
    name: "Payment History",
    path: "/admin/payment-history",
    icon: "/payment-history.svg",
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: "/analytics.svg",
  },
  {
    name: "Activity Logs",
    path: "/admin/activity-logs",
    icon: "/activity-logs.svg",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto">
      <div className="relative flex min-h-screen">
        {/* Admin Sidebar */}
        <div className="fixed left-auto top-[64px] z-30 hidden h-[calc(100vh-64px)] w-64 bg-base-200 shadow-lg md:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive ? "bg-primary text-white" : "hover:bg-base-300"
                      }`}
                    >
                      <Image
                        src={item.icon}
                        width={20}
                        height={20}
                        alt={item.name}
                        className={isActive ? "brightness-0 invert" : ""}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {/* <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-base-300 bg-base-200 p-2 md:hidden">
          <div className="container mx-auto">
            <div className="flex justify-around">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex flex-col items-center p-2 ${
                      isActive ? "text-primary" : ""
                    }`}
                  >
                    <Image
                      src={item.icon}
                      width={24}
                      height={24}
                      alt={item.name}
                      className={isActive ? "brightness-0" : ""}
                    />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8 md:pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
