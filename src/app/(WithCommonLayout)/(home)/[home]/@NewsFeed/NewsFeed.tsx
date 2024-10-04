import PostList from "./PostList";
import envConfig from "@/config/envConfig";

// Server-side function to fetch posts
async function getPosts() {
  try {
    const response = await fetch(`${envConfig.baseApi}/posts`, {
      next: { tags: ["posts"] },
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export default async function NewsFeedPage() {
  const posts = await getPosts(); // Fetch posts on the server

  return (
    <div className="my-2 border-t border-grey p-1 md:p-4">
      <PostList initialPosts={posts} />
    </div>
  );
}
