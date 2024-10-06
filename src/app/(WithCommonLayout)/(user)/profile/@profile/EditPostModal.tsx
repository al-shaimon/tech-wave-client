import { useState, useCallback, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import envConfig from "@/config/envConfig";

// Define or import the Category type
interface Category {
  _id: string;
  name: string;
}

// Define or import the Post type
interface Post {
  content: string;
  images?: string[];
  videos?: string[];
  category: string;
  isPaid: boolean;
  // Add other fields as necessary
}

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (updatedPost: Post) => void;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export default function EditPostModal({
  post,
  onClose,
  onUpdate,
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState<string[]>(post.images || []);
  const [videos, setVideos] = useState<string[]>(post.videos || []);
  const [newFiles, setNewFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState(post.category);
  const [isPaid, setIsPaid] = useState(post.isPaid);
  const [categories, setCategories] = useState<Category[]>([]);
  const quillRef = useRef<ReactQuill>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviewFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewFiles((prevFiles) => [...prevFiles, ...newPreviewFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
  });

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

  useEffect(() => {
    // Cleanup object URLs to avoid memory leaks
    return () => newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [newFiles]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${envConfig.baseApi}/post-categories`);
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload new files
      const uploadedUrls = await Promise.all(
        newFiles.map((file) => uploadToCloudinary(file.file)),
      );

      const newImages = uploadedUrls.filter((url) =>
        url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/),
      );
      const newVideos = uploadedUrls.filter((url) =>
        url.toLowerCase().match(/\.(mp4|webm|ogg)$/),
      );

      const updatedPost = {
        ...post,
        content,
        images: [...images, ...newImages],
        videos: [...videos, ...newVideos],
        category,
        isPaid,
      };

      onUpdate(updatedPost);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
      setIsUploading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
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
    );

    return response.data.secure_url;
  };

  const removeMedia = (url: string, type: "image" | "video") => {
    if (type === "image") {
      setImages(images.filter((img) => img !== url));
    } else {
      setVideos(videos.filter((vid) => vid !== url));
    }
  };

  const removeNewFile = (preview: string) => {
    setNewFiles(newFiles.filter((file) => file.preview !== preview));
  };

  return (
    <div className="fixed inset-0 z-[6666] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl rounded-lg bg-base-300 p-6">
        <h2 className="mb-4 text-2xl font-bold">Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="quill-wrapper">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              className="custom-quill mb-4"
              theme="snow"
            />
          </div>
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">Current Media</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <Image
                    src={img}
                    alt={`Image ${index}`}
                    width={100}
                    height={100}
                    className="rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(img, "image")}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-white"
                  >
                    <span>x</span>
                  </button>
                </div>
              ))}
              {videos.map((vid, index) => (
                <div key={index} className="relative">
                  <video
                    src={vid}
                    width={100}
                    height={100}
                    className="rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(vid, "video")}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            {...getRootProps()}
            className="mb-4 cursor-pointer rounded border-2 border-dashed border-gray-300 p-4 text-center"
          >
            <input {...getInputProps()} />
            <p>
              Drag &apos;n&apos; drop some files here, or click to select files
            </p>
          </div>

          {newFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">
                New Files to Upload
              </h3>
              <div className="flex flex-wrap gap-2">
                {newFiles.map((file, index) => (
                  <div key={index} className="relative">
                    {file.file.type.startsWith("image/") ? (
                      <Image
                        src={file.preview}
                        alt={`New Image ${index}`}
                        width={100}
                        height={100}
                        className="rounded"
                      />
                    ) : (
                      <video
                        src={file.preview}
                        width={100}
                        height={100}
                        className="rounded"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(file.preview)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold">Post Type</label>
            <select
              value={isPaid.toString()}
              onChange={(e) => setIsPaid(e.target.value === "true")}
              className="select select-bordered w-full"
            >
              <option value="true">Paid</option>
              <option value="false">Free</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded bg-gray-500 px-4 py-2 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-white"
              disabled={isUploading}
            >
              {isUploading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}