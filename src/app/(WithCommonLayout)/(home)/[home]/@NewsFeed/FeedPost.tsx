/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { format } from "date-fns";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useState } from "react";
import jsPDF from "jspdf";
import htmlParser from "html-react-parser";

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
      // Format the post date
      const postDate = new Date(post.timestamp);
      const formattedDate = format(postDate, "dd-MMMM-yyyy"); // e.g., 20-March-2024

      // Generate the dynamic filename
      const fileName = `${post.user.name}'s post ${formattedDate}.pdf`;

      const doc = new jsPDF();

      // Add post title
      doc.setFontSize(20);
      doc.text(`${post.user.name}'s Post`, 10, 20);

      // Parse and render the post content from HTML
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

      // Adjust the position for images
      yPosition += 10;

      // Add images (if any)
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

      // Check if we are near the bottom of the page and add a new page if necessary
      if (yPosition > 260) {
        // if there's no space for video links
        doc.addPage();
        yPosition = 20; // reset the position on the new page
      }

      // Add videos as links (if any)
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

      // Save the PDF
      doc.save(fileName);
      setLoading(false);
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
      setLoading(false);
    }
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
