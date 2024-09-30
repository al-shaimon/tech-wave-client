import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import Post from "@/app/(WithCommonLayout)/(home)/[home]/@Post/page";
import NewsFeed from "@/app/(WithCommonLayout)/(home)/[home]/@NewsFeed/NewsFeed";

export default function Home() {
  return (
    <>
      <Post />
      <NewsFeed />
    </>
  );
}
