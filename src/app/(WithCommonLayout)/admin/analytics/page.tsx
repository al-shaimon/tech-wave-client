import AnalyticsComponent from "@/app/(WithCommonLayout)/admin/analytics/AnalyticsComponent";
import React from "react";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Website Analytics</h1>
      <AnalyticsComponent />
    </div>
  );
}
