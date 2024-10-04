/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { format } from "date-fns";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import htmlParser from "html-react-parser";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  profilePhoto: string;
  username: string;
  name: string;
  isVerified: boolean;
  isFollowing: boolean;
}

interface Post {
  _id: string;
  user: {
    _id: string;
    profilePhoto: string;
    username?: string;
    email?: string;
    name: string;
    isVerified: boolean;
    isFollowing: boolean;
  };
  timestamp?: string; // Keep this for newsfeed
  createdAt?: string; // Add this for post details
  content: string;
  images: string[];
  videos: string[];
  votes: number;
  comments: number | Array<{ user: { name: string }; content: string }>;
}

export default function FeedPost({ post }: { post: Post }) {
  let timeAgo: string;

  const [loading, setLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.user.isFollowing);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: { id: string } = jwtDecode(token);
      setUserId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (userId === post.user._id) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${envConfig.baseApi}/auth/followers-following/${post.user._id}`,
          {
            headers: { Authorization: `${token}` },
          },
        );

        if (response.data.success) {
          setIsFollowing(response.data.data.isFollowing);
        }
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [post.user._id, userId]);

  try {
    const postDate = new Date(post.timestamp || post.createdAt || "");

    if (isNaN(postDate.getTime())) {
      throw new Error("Invalid date");
    }

    const now = new Date();
    const timeDifferenceInMs = now.getTime() - postDate.getTime();
    const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
    const timeDifferenceInDays = timeDifferenceInHours / 24;
    const timeDifferenceInMonths = timeDifferenceInDays / 30;

    if (timeDifferenceInHours < 24) {
      timeAgo = `${Math.round(timeDifferenceInHours)}h`;
    } else if (timeDifferenceInDays < 30) {
      timeAgo = `${Math.round(timeDifferenceInDays)}d`;
    } else if (timeDifferenceInMonths < 12) {
      timeAgo = `${Math.round(timeDifferenceInMonths)}mo`;
    } else {
      timeAgo = format(postDate, "MMM d, yyyy");
    }
  } catch (error) {
    console.error(
      "Error parsing date:",
      error,
      "Date value:",
      post.timestamp || post.createdAt,
    );
    timeAgo = "Invalid date";
  }

  const username2 = `@${post.user.email?.split("@")[0] || "unknown"}`;
  const username = `${post.user.username || username2}`;

  console.log("USER NAME", post.user);

  console.log("Post data:", post);

  // Helper function to convert an image URL to a Base64 data URL
  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image(); // Use the browser's native Image object
      img.crossOrigin = "Anonymous"; // To handle CORS issues if the images are from a different origin
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      img.onerror = () => {
        reject(new Error("Could not load image"));
      };
    });
  };

  const handleDownload = async () => {
    setLoading(true);

    try {
      const postDate = new Date(post.createdAt || "");
      const formattedDate = format(postDate, "dd-MMMM-yyyy");
      const fileName = `${post.user.name}'s post ${formattedDate}.pdf`;

      const doc = new jsPDF();

      // Add post title
      doc.setFontSize(20);
      doc.text(`${post.user.name}'s Post`, 10, 20);

      // Add post content
      let yPosition = 30;
      htmlParser(post.content, {
        replace: (domNode) => {
          if (domNode.type === "tag") {
            switch (domNode.name) {
              case "h1":
                doc.setFontSize(18);
                doc.text(
                  (domNode.children[0] as any).data || "",
                  10,
                  yPosition,
                );
                yPosition += 10;
                break;
              case "h2":
                doc.setFontSize(16);
                doc.text(
                  (domNode.children[0] as unknown as Text).data || "",
                  10,
                  yPosition,
                );
                yPosition += 10;
                break;
              case "p":
                doc.setFontSize(14);
                doc.text(
                  (domNode.children[0] as any).data || "",
                  10,
                  yPosition,
                );
                yPosition += 10;
                break;
              case "strong":
                doc.setFont("Helvetica", "bold");
                doc.text(
                  (domNode.children[0] as unknown as Text).data || "",
                  10,
                  yPosition,
                );
                yPosition += 10;
                break;
              default:
                // For other unsupported tags, just add text
                doc.setFontSize(14);
                doc.text(
                  (domNode.children[0] as unknown as Text).data || "",
                  10,
                  yPosition,
                );
                yPosition += 10;
                break;
            }
          }
        },
      });

      // Add images
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          // Convert the image to base64 before adding it to the PDF
          const base64Image = await convertImageToBase64(image);

          // Check if the current yPosition would exceed the page height
          if (yPosition + 120 > doc.internal.pageSize.height) {
            doc.addPage(); // Add a new page
            yPosition = 10; // Reset yPosition for new page
          }

          doc.addImage(base64Image, "JPEG", 10, yPosition, 180, 120); // Adjust width and height as necessary
          yPosition += 130; // Adjust spacing between images
        }
      }

      // Add videos as links
      if (post.videos && post.videos.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 255); // Make the link blue for better visibility
        post.videos.forEach((video) => {
          doc.textWithLink(`Watch Video: ${video}`, 10, yPosition, {
            url: video,
          });
          yPosition += 10;
        });
      }

      // Add comments
      if (Array.isArray(post.comments) && post.comments.length > 0) {
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(16);
        doc.text("Comments", 10, yPosition);
        yPosition += 10;

        post.comments.forEach((comment, index) => {
          doc.setFontSize(12);
          doc.text(`${comment.user.name}: ${comment.content}`, 10, yPosition);
          yPosition += 10;

          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }

      // Save the PDF
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUnfollow = async () => {
    if (!userId || userId === post.user._id) return;

    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? "unfollow" : "follow";
      const response = await axios.post(
        `${envConfig.baseApi}/auth/${endpoint}/${post.user._id}`,
        {},
        {
          headers: { Authorization: `${token}` },
        },
      );

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        toast.success(`Successfully ${endpoint}ed ${post.user.name}`);
      }
    } catch (error) {
      console.error(
        `Error ${isFollowing ? "unfollowing" : "following"} user:`,
        error,
      );
      toast.error(`Failed to ${isFollowing ? "unfollow" : "follow"} user.`);
    }
  };

  // const handleCommentClick = () => {
  //   router.push(`/post/${post._id}`);
  // };

  return (
    <div className="mb-4 rounded-lg border-grey bg-base-100 py-4 shadow-2xl md:w-full md:border md:p-4">
      <div className="flex items-start">
        <Image
          className="h-8 w-8 rounded-full md:h-12 md:w-12"
          src={post.user.profilePhoto || "/default-profile-photo.jpg"}
          alt={post.user.username || "default-username"}
          width={48}
          height={48}
        />
        <div className="ml-2 w-full text-sm md:ml-4 md:text-base">
          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="font-bold">{post.user.name}</span>{" "}
              {post.user.isVerified === true ? (
                <Image
                  className="ml-[3px] mr-[5px]"
                  src="/verified.svg"
                  alt="Verified"
                  width={20}
                  height={20}
                />
              ) : (
                <span className="mx-[5px]"></span>
              )}
              <span className="text-gray-500">{username}</span>
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
                  className="menu dropdown-content menu-sm z-[99] mt-3 w-52 rounded-box bg-base-200 p-4 shadow"
                >
                  {userId && userId !== post.user._id && (
                    <li className="my-1">
                      <button onClick={handleFollowUnfollow}>
                        <Image
                          src={isFollowing ? "/remove.svg" : "/add.svg"}
                          width={16}
                          height={16}
                          alt={isFollowing ? "unfollow icon" : "follow icon"}
                        />
                        {isFollowing
                          ? `Unfollow ${post.user.name}`
                          : `Follow ${post.user.name}`}
                      </button>
                    </li>
                  )}
                  <li className="my-1">
                    <button onClick={handleDownload}>
                      <Image
                        src="/download.svg"
                        width={16}
                        height={16}
                        alt="download icon"
                      />
                      {loading ? "Generating PDF..." : "Download as PDF"}
                    </button>
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
              commentsCount={
                typeof post.comments === "number"
                  ? post.comments
                  : post.comments.length
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
