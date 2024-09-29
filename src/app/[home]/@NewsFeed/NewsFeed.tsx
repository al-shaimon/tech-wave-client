import Post from "./FeedPost"; // Import Post component

export default function NewsFeed() {
  // Dummy data for posts
  const postsData = [
    {
      id: 1,
      user: {
        name: "John Doe",
        username: "@johndoe",
        profilePic: "/picture.jpg",
      },
      content:
        "This is a sample tweet-like post. Tailwind CSS makes styling so easy!",
      images: ["/picture.jpg", "/picture.jpg"],
      videos: [],
      timestamp: "2h ago",
      votes: 0,
      comments: 5,
    },
    {
      id: 2,
      user: {
        name: "Joe Smith",
        username: "@joesmith",
        profilePic: "/picture.jpg",
      },
      content: "Another day, another line of code. Keep pushing forward!",
      images: [],
      videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
      timestamp: "4h ago",
      votes: 3,
      comments: 7,
    },
    {
      id: 3,
      user: {
        name: "Alice Johnson",
        username: "@alicejohnson",
        profilePic: "/picture.jpg",
      },
      content: "Learning React is fun!",
      images: ["/picture.jpg"],
      videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
      timestamp: "1h ago",
      votes: -1,
      comments: 3,
    },
  ];

  return (
    <div className="my-2 border-t border-grey p-4">
      {/* Feed */}
      {postsData.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
