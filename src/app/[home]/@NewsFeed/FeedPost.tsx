import Image from "next/image";
import VoteButtons from "./VoteButtons";
import PostLightGallery from "./PostLightGallery"; // Import the new client component

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
            <span className="text-gray-500">{post.timestamp}</span>
          </div>
          {/* Post Content */}
          <p className="my-2 md:text-lg">{post.content}</p>

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
