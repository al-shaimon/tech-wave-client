import Image from "next/image";
import VoteButtons from "./VoteButtons";

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
    <div className="mb-4 w-full rounded-lg bg-base-100 p-4 shadow-md">
      <div className="flex items-start">
        {/* User Profile Picture */}
        <Image
          className="rounded-full"
          src={post.user.profilePic}
          alt={post.user.username}
          width={48}
          height={48}
        />
        <div className="ml-4 w-full">
          {/* User Info */}
          <div className="flex justify-between">
            <div>
              <span className="font-bold">{post.user.name}</span>{" "}
              <span className="text-gray-500">{post.user.username}</span>
            </div>
            <span className="text-gray-500">{post.timestamp}</span>
          </div>
          {/* Post Content */}
          <p className="my-2 text-lg">{post.content}</p>

          {/* Media (Images and Videos) */}
          {post.images.length > 0 && (
            <div
              className={`mt-2 ${
                post.images.length === 1
                  ? "w-full"
                  : "grid grid-cols-1 gap-2 sm:grid-cols-2"
              }`}
            >
              {post.images.map((image, index) => (
                <div
                  key={index}
                  className={`${
                    post.images.length === 1 ? "relative w-full h-96" : "relative h-96"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          )}

          {post.videos.length > 0 && (
            <div className="mt-2">
              {post.videos.map((video, index) => (
                <video key={index} controls className="rounded-md w-full">
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}

          {/* Voting and Commenting Actions */}
          <div className="mt-2 flex items-center text-gray-500">
            <VoteButtons initialVotes={post.votes} commentsCount={post.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
