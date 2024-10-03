import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw"; // To enable HTML rendering in Markdown

interface User {
  profilePic: string;
  username: string;
  name: string;
}

interface Post {
  user: User;
  timestamp: string;
  content: string;
  images: string[];
  videos: string[];
  votes: number;
  comments: number;
}

export default function FeedPost({ post }: { post: Post }) {
  // Parse the timestamp and handle potential invalid date issues
  let timeAgo: string;

  try {
    const postDate = new Date(post.timestamp);

    // Check if the date is valid
    if (isNaN(postDate.getTime())) {
      throw new Error("Invalid date");
    }

    // Calculate how long ago the post was made
    timeAgo = formatDistanceToNow(postDate, { addSuffix: true });
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    timeAgo = "Invalid date";
  }

  return (
    <div className="mb-4 rounded-lg bg-base-100 py-4 shadow-md md:w-full md:p-4">
      <div className="flex items-start">
        {/* User Profile Picture */}
        <Image
          className="rounded-full"
          src={post.user.profilePic}
          alt={post.user.username}
          width={48}
          height={48}
        />
        <div className="ml-2 w-full text-sm md:ml-4 md:text-base">
          {/* User Info */}
          <div className="flex justify-between">
            <div>
              <span className="font-bold">{post.user.name}</span>{" "}
              <span className="text-gray-500">{post.user.username}</span>
            </div>
            {/* Show how long ago the post was made */}
            <span className="text-gray-500">{timeAgo}</span>
          </div>

          {/* Post Content with ReactMarkdown and rehypeRaw for HTML support */}
          <div className="markdown-content">
            <ReactMarkdown
              className="prose-sm text-white md:prose-lg prose-h1:text-2xl prose-h2:text-xl prose-p:text-sm md:prose-h1:text-4xl md:prose-h2:text-3xl md:prose-p:text-[15px]"
              rehypePlugins={[rehypeRaw]} // Allow rendering raw HTML
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Media (Images and Videos) */}
          {post.images.length > 0 && (
            <div>
              <PostLightGallery images={post.images} />
            </div>
          )}

          {post.videos.length > 0 && (
            <div className="mt-2">
              {post.videos.map((video, index) => (
                <video key={index} controls className="w-full rounded-md">
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}

          {/* Voting and Commenting Actions */}
          <div className="mt-2 flex items-center text-gray-500">
            <VoteButtons
              initialVotes={post.votes}
              commentsCount={post.comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
