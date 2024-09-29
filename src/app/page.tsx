import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import Post from "@/app/[home]/@Post/page";
import NewsFeed from "@/app/[home]/@NewsFeed/NewsFeed";

export default function Home() {
  return (
    <>
      <Navbar />
      <Post />
      <NewsFeed />
    </>
  );
}
