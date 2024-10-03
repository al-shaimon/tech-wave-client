"use client"; // Ensures the component is client-side
import { useEffect, useState } from "react";
import Image from "next/image";
import LoginSignupModal from "./LoginSignupModal"; // Import the modal
import Link from "next/link";
import { jwtDecode, JwtPayload } from "jwt-decode"; // Corrected import
import LogoutButton from "@/components/Navbar/LogoutButton";
import { useRouter } from "next/navigation";

interface ExtendedJwtPayload extends JwtPayload {
  role: string;
  profilePhoto?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<ExtendedJwtPayload | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Safely access localStorage on the client side
    const token = localStorage.getItem("token");
    const photo = localStorage.getItem("profilePhoto");

    if (token) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(token);
      setUser(decodedUser);
    }

    if (photo) {
      setProfilePhoto(photo);
    }
  }, []); // Runs once after component mounts

  const handleHome = async () => {
    router.push("/"); // Navigate to the home page
    // Revalidate the posts tag
    await fetch("/api/revalidate?tag=posts");

    router.refresh(); // Refresh the page to update the
  };

  return (
    <div className="navbar my-2 border-b border-grey">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>

        <div className="md:hidden">
          <Image src="/l1.png" width={26} height={26} alt="TechWave" />
        </div>

        <div className="hidden md:block">
          <button onClick={handleHome}>
            <Image src="/l3.png" width={150} height={50} alt="TechWave" />
          </button>
        </div>
      </div>

      {/* Search Input Fields */}
      <div className="navbar-center">
        <div className="form-control w-40 md:w-[300px] lg:w-[560px]">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="avatar btn btn-circle btn-ghost"
            >
              <div className="w-10 rounded-full">
                <Image
                  src={profilePhoto || "/picture.jpg"}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt="Profile"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[99] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              {user.role === "admin" && (
                <li>
                  <Link href="/admin/dashboard" className="justify-between">
                    Dashboard
                  </Link>
                </li>
              )}
              {user.role === "user" && (
                <li>
                  <Link href="/profile" className="justify-between">
                    Profile
                  </Link>
                </li>
              )}
              <li>
                <a>Settings</a>
              </li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <LoginSignupModal />
          </div>
        )}
      </div>
    </div>
  );
}
