import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
}

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem("profilePhoto") || user.profilePhoto,
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
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
      );

      setProfilePhoto(response.data.secure_url);
      toast.success("Profile photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      toast.error("Error uploading profile photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, profilePhoto });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-black bg-opacity-50 p-6 transition-opacity">
        <h2 className="mb-4 text-2xl font-bold">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-bold" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-bold" htmlFor="phone">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-bold">Profile Photo</label>
            <div className="flex items-center">
              <Image
                src={profilePhoto}
                alt="Profile"
                width={64}
                height={64}
                className="mr-4 rounded-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profilePhotoInput"
              />
              <label
                htmlFor="profilePhotoInput"
                className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                {isUploading ? "Uploading..." : "Change Photo"}
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
