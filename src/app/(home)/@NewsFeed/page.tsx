import Post from "./FeedPost"; // Import Post component

export default function NewsFeed() {
  // Dummy data for posts
  const postsData = [
    {
      id: 1,
      user: {
        name: "John Doe",
        username: "@johndoe",
        profilePic: "/pic.jpg",
      },
      content:
        "This is a sample tweet-like post. Tailwind CSS makes styling so easy!",
      images: ["/pic.jpg", "/pic.jpg"],
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
        profilePic: "/pic.jpg",
      },
      content: "Another day, another line of code. Keep pushing forward!",
      images: [],
      videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
      timestamp: "4h ago",
      votes: 2,
      comments: 2,
    },
    {
      id: 3,
      user: {
        name: "Alice Johnson",
        username: "@alicejohnson",
        profilePic: "/pic.jpg",
      },
      content: "Learning React is fun!",
      images: ["/pic.jpg"],
      videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
      timestamp: "1h ago",
      votes: -1,
      comments: 3,
    },
  ];

  return (
    <div className="border-grey my-2 border-t p-4">
      {/* Feed */}
      {postsData.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
