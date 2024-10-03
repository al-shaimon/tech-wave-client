import Image from "next/image";
import { format } from "date-fns";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useState } from "react";

interface User {
  profilePhoto: string;
  username: string;
  name: string;
}

interface Post {
  _id: string;
  user: User;
  timestamp: string;
  content: string;
  images: string[];
  videos: string[];
  votes: number;
  comments: number;
}

export default function FeedPost({ post }: { post: Post }) {
  let timeAgo: string;

  const [loading, setLoading] = useState(false);

  try {
    const postDate = new Date(post.timestamp);
    const now = new Date();
    const timeDifferenceInMs = now.getTime() - postDate.getTime();
    const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
    const timeDifferenceInDays = timeDifferenceInHours / 24;
    const timeDifferenceInMonths = timeDifferenceInDays / 30;

    if (isNaN(postDate.getTime())) {
      throw new Error("Invalid date");
    }

    if (timeDifferenceInHours < 24) {
      if (timeDifferenceInHours < 1) {
        const timeDifferenceInMinutes = Math.floor(
          timeDifferenceInMs / (1000 * 60),
        );
        timeAgo = `${timeDifferenceInMinutes} min. ago`;
      } else {
        timeAgo = `${Math.floor(timeDifferenceInHours)} hr. ago`;
      }
    } else if (timeDifferenceInDays < 30) {
      timeAgo = `${Math.floor(timeDifferenceInDays)} days ago`;
    } else if (timeDifferenceInMonths < 12) {
      timeAgo = `${Math.floor(timeDifferenceInMonths)} month${timeDifferenceInMonths > 2 ? "s" : ""} ago`;
    } else {
      timeAgo = format(postDate, "MMM d, yyyy");
    }
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    timeAgo = "Invalid date";
  }

  const handleDownload = async () => {
    setLoading(true);

    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { font-size: 24px; font-weight: bold; }
          h2 { font-size: 20px; font-weight: semibold; }
          p { font-size: 14px; margin-top: 5px; }
          img { max-width: 100%; margin-top: 5px; }
        </style>
      </head>
      <body>
        <h1>${post.user.name}'s Post</h1>
          <div>
            <p>${post.content}</p>
            ${
              post.images && post.images.length > 0
                ? post.images
                    .map((image) => `<img src="${image}" alt="Image" />`)
                    .join("")
                : ""
            } 
            ${
              post.videos && post.videos.length > 0
                ? post.videos
                    .map(
                      (video) => `
                    <p>
                      <a href="${video}" target="_blank">Watch Video</a>
                    </p>
                    `,
                    )
                    .join("")
                : ""
            }
          </div>
      </body>
      </html>
    `;

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: htmlContent }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "post.pdf";
    link.click();
    window.URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <div className="mb-4 rounded-lg bg-base-100 py-4 shadow-md md:w-full md:p-4">
      <div className="flex items-start">
        <Image
          className="rounded-full"
          src={post.user.profilePhoto || "/default-profile-photo.jpg"}
          alt={post.user.username}
          width={48}
          height={48}
        />
        <div className="ml-2 w-full text-sm md:ml-4 md:text-base">
          <div className="flex justify-between">
            <div>
              <span className="font-bold">{post.user.name}</span>{" "}
              <span className="text-gray-500">{post.user.username}</span>
              <span className="ml-3 text-gray-500">•</span>
              <span className="ml-3 text-gray-500">{timeAgo}</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content menu-sm z-[99] mt-3 w-52 rounded-box bg-base-200 p-2 shadow"
                >
                  <li>
                    <a onClick={handleDownload}>
                      {loading ? "Generating PDF..." : "Download as PDF"}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="markdown-content">
            <ReactMarkdown
              className="prose-sm text-white md:prose-lg prose-h1:text-2xl prose-h2:text-xl prose-p:text-sm md:prose-h1:text-4xl md:prose-h2:text-3xl md:prose-p:text-[15px]"
              rehypePlugins={[rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {post.images && post.images.length > 0 && (
            <div>
              <PostLightGallery images={post.images} />
            </div>
          )}

          {post.videos && post.videos.length > 0 && (
            <div className="mt-2">
              {post.videos.map((video, index) => (
                <video key={index} controls className="w-full rounded-md">
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center text-gray-500">
            <VoteButtons
              postId={post._id}
              initialVotes={post.votes}
              commentsCount={post.comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
