import Post from "./FeedPost";

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
      content: "<p>how are you</p>",
      images: [
        "https://res.cloudinary.com/dr4guscnl/image/upload/v1727726501/z07wulgmbukwm69ixhbx.jpg",
        "https://res.cloudinary.com/dr4guscnl/image/upload/v1727726501/prtsecy0an4pe0of8gqa.jpg",
        "https://res.cloudinary.com/dr4guscnl/image/upload/v1727726501/wezouvlkx0wox1x7bs4s.jpg",
      ],
      videos: [
        "https://res.cloudinary.com/dr4guscnl/video/upload/v1727726502/w9fvyjjfzeh91bx6ipyc.mp4",
      ],
      timestamp: "2024-09-30T20:05:24.335Z",
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
