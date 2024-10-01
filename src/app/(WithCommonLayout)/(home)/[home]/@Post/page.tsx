/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// CreatePost.tsx
import Image from "next/image";
import { useState, useRef, forwardRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

interface User {
  name: string;
  username: string;
  profilePhoto: string;
}

interface PostData {
  content: string;
  images: string[];
  videos: string[];
}

export default function CreatePost() {
  const [user, setUser] = useState<User | null>(null);
  const [previewMedia, setPreviewMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const quillRef = useRef<any>(null);

  const { control, handleSubmit, reset } = useForm<PostData>({
    defaultValues: {
      content: "",
      images: [],
      videos: [],
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
        console.log("User decoded:", decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
        toast.error("Failed to decode user information. Please log in again.");
      }
    } else {
      toast.error("User not found in localStorage.");
    }
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "q5w9equz");
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
      toast.error("Error uploading media. Please try again later.");
      return null;
    }
  };

  const onSubmit = async (data: PostData) => {
    if (!user) {
      toast.error("User is not authenticated. Please login.");
      return;
    }

    try {
      toast.info("Posting...", { duration: 2000 });
      setIsLoading(true);

      const uploadedUrls = await Promise.all(
        localFiles.map((file) => uploadToCloudinary(file)),
      );

      const uploadedImages = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("image"),
      );
      const uploadedVideos = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("video"),
      );

      const newPost = {
        user,
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

      reset();
      setPreviewMedia([]);
      setLocalFiles([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating post:", error);
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const updatedPreviewMedia: Array<{ type: "image" | "video"; url: string }> =
      [];

    fileArray.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select images or videos smaller than 5 MB.");
        return;
      }

      const fileType = file.type.startsWith("image") ? "image" : "video";
      const url = URL.createObjectURL(file);

      updatedPreviewMedia.push({ type: fileType, url });
    });

    setPreviewMedia((prev) => [...prev, ...updatedPreviewMedia]);
    setLocalFiles((prev) => [
      ...prev,
      ...fileArray.filter((file) => file.size <= 5 * 1024 * 1024),
    ]);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", { list: "bullet" }],
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

  const focusQuill = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.focus();
    }
  };

  useEffect(() => {
    // Focus the Quill editor when the component mounts
    focusQuill();
  }, []);

  if (!user) {
    return (
      <div className="my-4 p-4 text-center text-white">
        <p>Please Log in to enlighten us.</p>
      </div>
    );
  }

  return (
    <div className="my-2 p-4 text-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start">
          {user && (
            <div className="mr-4">
              <Image
                className="rounded-full"
                src={user.profilePhoto}
                width={48}
                height={48}
                alt="Profile"
              />
            </div>
          )}
          <div className="w-32 flex-1 md:w-96">
            <div className="quill-wrapper" onClick={focusQuill}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    {...field}
                    ref={quillRef}
                    placeholder="Share your tech journey…"
                    modules={quillModules}
                    formats={quillFormats}
                    className="custom-quill mb-4 text-white"
                    theme="snow"
                  />
                )}
              />
            </div>

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
