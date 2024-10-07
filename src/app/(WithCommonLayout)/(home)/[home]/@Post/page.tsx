/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import envConfig from "@/config/envConfig";

const ReactQuill = dynamic(
  () => import("react-quill").then((mod) => mod.default),
  { ssr: false },
);

interface User {
  id: string;
  _id: string;
  name: string;
  username: string;
  profilePhoto: string;
}

interface PostData {
  content: string;
  images: string[];
  videos: string[];
  category: string;
  isPaid: boolean;
}

interface Category {
  _id: string;
  name: string;
}

export default function CreatePost() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const quillRef = useRef<any>(null);
  const router = useRouter();

  const { control, handleSubmit, reset, watch } = useForm<PostData>({
    defaultValues: {
      content: "",
      images: [],
      videos: [],
      category: "",
      isPaid: false,
    },
  });

  const selectedCategory = watch("category");
  const isPaid = watch("isPaid");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
        setProfilePhoto(
          localStorage.getItem("profilePhoto") || decodedUser.profilePhoto,
        );
      } catch (error) {
        console.error("Invalid token:", error);
        toast.error("Failed to decode user information. Please log in again.");
      }
    }

    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${envConfig.baseApi}/post-categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

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
        { headers: { "Content-Type": "multipart/form-data" } },
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

    if (!data.category) {
      toast.error("Please select a category for your post.");
      return;
    }

    try {
      setIsLoading(true);
      toast.info("Creating post...", { duration: 2000 });

      const uploadedUrls = await Promise.all(
        localFiles.map((file) => uploadToCloudinary(file)),
      );

      const uploadedImages = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("image"),
      );
      const uploadedVideos = uploadedUrls.filter((url, index) =>
        localFiles[index]?.type.startsWith("video"),
      );

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const newPost = {
        content: data.content,
        images: uploadedImages,
        videos: uploadedVideos,
        category: data.category,
        isPaid: data.isPaid,
        user: user.id,
      };

      const response = await axios.post(`${envConfig.baseApi}/posts`, newPost, {
        headers: { Authorization: `${token}` },
      });

      console.log("New post created:", response.data);
      toast.success("Post created successfully!");

      reset();
      setPreviewMedia([]);
      setLocalFiles([]);

      fetch("/api/revalidate?tag=posts");
      // window.location.href = "/";
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-start">
          {user && (
            <div className="mr-4">
              <Image
                className="h-8 w-8 rounded-full md:h-12 md:w-12"
                src={profilePhoto!}
                width={48}
                height={48}
                alt="Profile"
              />
            </div>
          )}
          <div className="w-full">
            <div className="quill-wrapper" onClick={focusQuill}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    {...field}
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

            <div className="flex flex-wrap items-center justify-between space-y-2 md:mt-4 md:flex-nowrap md:space-x-4 md:space-y-0">
              <div className="flex w-full items-center space-x-2 md:w-auto">
                <label className="btn btn-outline btn-sm text-primary">
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
              <div className="w-full md:w-1/3">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value.toString()}
                      className="select select-bordered select-sm w-full"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div className="w-full md:w-1/3">
                <Controller
                  name="isPaid"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <select
                      {...field}
                      value={value ? "true" : "false"}
                      onChange={(e) => onChange(e.target.value === "true")}
                      className="select select-bordered select-sm w-full"
                    >
                      <option value="true">Paid</option>
                      <option value="false">Free</option>
                    </select>
                  )}
                />
              </div>
              <div className="mt-4 md:flex md:w-1/2 md:justify-end">
                <button
                  type="submit"
                  className={`btn btn-sm bg-primary text-white ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
