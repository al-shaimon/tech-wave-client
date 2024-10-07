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
import PaymentModal from "@/components/PaymentModal";
import React from "react";
import SkeletonLoader from "@/components/SkeletonLoader";

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
    role?: string;
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
  isPaid: boolean;
  category: string;
}

interface DecodedToken {
  id: string;
  role: string;
}

interface FeedPostProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  isProfilePage?: boolean;
  isAdminView?: boolean;
  hideFollowButton?: boolean;
}

export default function FeedPost({
  post,
  onEdit,
  onDelete,
  isProfilePage = false,
  isAdminView = false,
  hideFollowButton = false,
}: FeedPostProps) {
  let timeAgo: string;

  const [loading, setLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.user.isFollowing);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(!post.isPaid);
  const [isVerified, setIsVerified] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isVerified = localStorage.getItem("isVerified") === "true";

    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
      setIsPostOwner(decodedToken.id === post.user._id);
      setIsUserVerified(isVerified || decodedToken.role === "admin");
      setUserRole(decodedToken.role);
    }
    setIsLoading(false);
  }, [post.user._id]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (userId === post.user._id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
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

        const data = await axios.get(`${envConfig.baseApi}/auth/${userId}`, {
          headers: { Authorization: `${token}` },
        });
        setIsUserVerified(data.data.data.isVerified);
        // Revalidate the posts tag
        await fetch("/api/revalidate?tag=posts");

        router.refresh(); // Refresh the page to update the newsfeed
      } catch (error) {
        console.error("Error fetching follow status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowStatus();
  }, [post.user._id, router, userId]);

  try {
    const postDate = new Date(post.timestamp || post.createdAt || "");

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
        timeAgo = `${timeDifferenceInMinutes}m`;
      } else {
        timeAgo = `${Math.floor(timeDifferenceInHours)}h`;
      }
    } else if (timeDifferenceInDays < 30) {
      timeAgo = `${Math.floor(timeDifferenceInDays)}d`;
    } else if (timeDifferenceInMonths < 12) {
      timeAgo = `${Math.floor(timeDifferenceInMonths)}mon`;
    } else {
      timeAgo = format(postDate, "MMM d, yyyy");
    }
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    timeAgo = "Invalid date";
  }


  const username2 = `@${post.user.email?.split("@")[0] || "unknown"}`;
  const username = `${post.user.username || username2}`;

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
      const formattedDate = format(postDate, "dd-MMMM-yyyyy");
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

  const handleUnlock = () => {
    if (localStorage.getItem("token") === null) {
      toast.error("Please login to unlock this post.");
      return router.push("/login");
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    setIsUserVerified(true);
    setIsUnlocked(true);
    toast.success(
      "Payment successful! You are now verified and can view all paid posts.",
    );
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: { id: string } = jwtDecode(token);
        setUserId(decodedToken.id);
        setIsPostOwner(decodedToken.id === post.user._id);

        const response = await axios.get(
          `${envConfig.baseApi}/auth/${decodedToken.id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );

        setIsUserVerified(response.data.data.isVerified);
        localStorage.setItem("isVerified", response.data.data.isVerified.toString());
        
        // Revalidate the posts tag
        await fetch("/api/revalidate?tag=posts");

        router.refresh(); // Refresh the page to update the newsfeed
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    }
  };

  console.log("ADMIIIIIIIIIIIIIIIIN", post);

  return (
    <>
      <div className="relative mb-4 w-full rounded-lg border-grey bg-base-100 py-4 shadow-2xl md:border md:p-4">
        {post.isPaid &&
          !isUserVerified &&
          !isPostOwner &&
          userRole !== "admin" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-md">
              <button onClick={handleUnlock} className="btn btn-primary">
                Pay $20 to Unlock All Premium Posts
              </button>
            </div>
          )}
        <div
          className={
            post.isPaid &&
            !isUserVerified &&
            !isPostOwner &&
            userRole !== "admin"
              ? "blur-sm filter"
              : ""
          }
        >
          {/* Existing post content */}
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
                  <span className="text-sm font-bold md:text-base">
                    {post.user.name}
                  </span>{" "}
                  {post.user.isVerified === true ? (
                    <Image
                      className="ml-[2px] mr-[3px] md:ml-[3px] md:mr-[5px]"
                      src="/verified.svg"
                      alt="Verified"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <span className="mx-[2px] md:mx-[5px]"></span>
                  )}
                  <span className="text-sm text-gray-500 md:text-base">
                    {username}
                  </span>
                  <span className="ml-1 text-sm text-gray-500 md:ml-3 md:text-base">
                    •
                  </span>
                  <span className="ml-1 text-sm text-gray-500 md:ml-3 md:text-base">
                    {timeAgo}
                  </span>
                  {post.isPaid === true && (
                    <div className="badge badge-primary badge-outline badge-xs mx-[3.5px] md:badge-md md:mx-4">
                      Premium
                    </div>
                  )}
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
                      {userId &&
                        userId !== post.user._id &&
                        !hideFollowButton && (
                          <li className="my-1">
                            <button onClick={handleFollowUnfollow}>
                              <Image
                                src={isFollowing ? "/remove.svg" : "/add.svg"}
                                width={16}
                                height={16}
                                alt={
                                  isFollowing ? "unfollow icon" : "follow icon"
                                }
                              />
                              {isFollowing
                                ? `Unfollow ${post.user.name}`
                                : `Follow ${post.user.name}`}
                            </button>
                          </li>
                        )}
                      {(isProfilePage || isAdminView) && (
                        <li className="my-1">
                          <button onClick={onDelete}>
                            <Image
                              src="/delete.svg"
                              width={16}
                              height={16}
                              alt="delete icon"
                            />
                            Delete Post
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
                  className="prose-sm text-white md:prose-lg prose-h1:text-2xl prose-h2:text-xl prose-p:text-sm md:prose-h1:text-3xl md:prose-h2:text-2xl md:prose-p:text-[15px]"
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
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}