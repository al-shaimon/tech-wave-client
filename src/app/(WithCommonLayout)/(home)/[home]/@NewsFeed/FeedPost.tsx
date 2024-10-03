import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

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

  try {
    const postDate = new Date(post.timestamp);
    if (isNaN(postDate.getTime())) {
      throw new Error("Invalid date");
    }
    timeAgo = formatDistanceToNow(postDate, { addSuffix: true });
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    timeAgo = "Invalid date";
  }

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
            </div>
            <span className="text-gray-500">{timeAgo}</span>
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
