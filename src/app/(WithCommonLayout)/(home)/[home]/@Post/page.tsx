/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState, useRef, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import axios from "axios";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () =>
    import("react-quill").then((mod) => {
      const QuillWithRef = forwardRef((props: any, ref) => (
        <mod.default {...props} ref={ref} />
      ));
      QuillWithRef.displayName = "QuillWithRef";
      return QuillWithRef;
    }),
  { ssr: false },
);

// Mock user data
const currentUser = {
  name: "Alice Johnson",
  username: "@alicejohnson",
  profilePic: "/picture.jpg",
};

interface PostData {
  content: string;
  images: string[];
  videos: string[];
}

export default function CreatePost() {
  const [previewMedia, setPreviewMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(false); // State for post button
  const [localFiles, setLocalFiles] = useState<File[]>([]); // Local files before upload
  const quillRef = useRef<any>(null);

  const { control, handleSubmit, reset } = useForm<PostData>({
    defaultValues: {
      content: "",
      images: [],
      videos: [],
    },
  });

  // Upload media to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "q5w9equz"); // Cloudinary preset
      formData.append(
        "cloud_name",
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      );

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  };

  // Handle post submission
  const onSubmit = async (data: PostData) => {
    try {
      toast.info("Posting...", { duration: 2000 });

      setIsLoading(true);

      // Upload media files only after the user clicks the post button
      const uploadedUrls = await Promise.all(
        localFiles.map((file) => uploadToCloudinary(file)),
      );

      // Separate images and videos
      const uploadedImages = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("image"),
      );
      const uploadedVideos = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("video"),
      );

      // Create post object
      const newPost = {
        user: currentUser,
        content: data.content,
        images: uploadedImages,
        videos: uploadedVideos,
        timestamp: new Date().toISOString(),
        votes: 0,
        comments: 3,
      };

      console.log("New post created:", newPost);

      // Simulate API call
      // await axios.post("/api/posts", newPost);

      // Reset the form and preview
      reset();
      setPreviewMedia([]);
      setLocalFiles([]);
      setIsLoading(false); // Stop loading after post
    } catch (error) {
      console.error("Error creating post:", error);
      setIsLoading(false); // Reset button loading state on error
    }
  };

  // Handle file input for images and videos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const updatedPreviewMedia = fileArray.map((file) => {
      const fileType = file.type.startsWith("image") ? "image" : "video";
      const url = URL.createObjectURL(file); // Create a local preview URL
      return { type: fileType, url };
    });

    setPreviewMedia((prev) => [
      ...prev,
      ...updatedPreviewMedia.map((media) => ({
        type: media.type as "image" | "video",
        url: media.url,
      })),
    ]); // Show preview
    setLocalFiles((prev) => [...prev, ...fileArray]); // Save local files
  };

  // Quill editor modules and formats with lists
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "bullet" }],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
  ];

  return (
    <div className="my-2 p-4 text-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start">
          <div className="mr-4">
            <Image
              className="rounded-full"
              src={currentUser.profilePic}
              width={48}
              height={48}
              alt="Profile"
            />
          </div>
          <div className="flex-1">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  {...field}
                  ref={quillRef}
                  placeholder=""
                  modules={quillModules}
                  formats={quillFormats}
                  className="mb-4 text-white"
                />
              )}
            />

            {/* Media Previews */}
            <div className="mt-2 flex flex-wrap">
              {previewMedia.map((media, index) => (
                <div
                  key={index}
                  className="relative mb-2 mr-2 h-24 w-24 overflow-hidden rounded-lg md:h-44 md:w-44"
                >
                  {media.type === "image" ? (
                    <Image
                      src={media.url}
                      layout="fill"
                      objectFit="cover"
                      alt="Preview"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="h-full w-full object-cover"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>

            {/* File Input */}
            <div className="mt-2 flex items-center justify-between">
              <div>
                <label className="mr-2 cursor-pointer text-primary hover:text-info">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  Photo/Video
                </label>
              </div>

              {/* Post Button with Loading State */}
              <button
                type="submit"
                className={`btn rounded-full bg-primary text-white ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
