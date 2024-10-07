/* eslint-disable react-hooks/exhaustive-deps */
"use client"; // Ensures the component is client-side
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import LoginSignupModal from "./LoginSignupModal"; // Import the modal
import Link from "next/link";
import { jwtDecode } from "jwt-decode"; // Corrected import
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import axios from "axios";
import { debounce } from "lodash";
import envConfig from "@/config/envConfig";
import SearchResults from "./SearchResults";

interface ExtendedJwtPayload {
  id: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<ExtendedJwtPayload | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const photo = localStorage.getItem("profilePhoto");

    if (token) {
      const decodedUser = jwtDecode<ExtendedJwtPayload>(token);
      setUser(decodedUser);
    }

    if (photo) {
      setProfilePhoto(photo);
    }
  }, []);

  const handleHome = async () => {
    router.push("/"); // Navigate to the home page
    // Revalidate the posts tag
    await fetch("/api/revalidate?tag=posts");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const response = await axios.get(`${envConfig.baseApi}/posts`, {
          params: { searchTerm: query },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error("Error searching posts:", error);
      }
    }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="navbar my-2 border-b border-grey">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost" onClick={toggleMenu}>
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
          </label>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[999] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          )}
        </div>
        <button onClick={handleHome} className="lg:hidden">
          <Image src="/l.png" width={150} height={50} alt="TechWave" />
        </button>
        <button onClick={handleHome} className="hidden lg:block">
          <Image src="/l3.png" width={150} height={50} alt="TechWave" />
        </button>
      </div>

      <div className="navbar-center">
        <div className="form-control relative ml-2 w-40 md:w-[300px] lg:w-[560px]">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <SearchResults
              results={searchResults}
              onResultClick={clearSearch}
            />
          )}
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
                <>
                  <li>
                    <Link href="/admin/dashboard" className="justify-between">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/manage-content">
                      <Image
                        src="/manage-posts.svg"
                        width={20}
                        height={20}
                        alt="Manage Posts"
                      />
                      Manage Posts
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/payment-history">
                      <Image
                        src="/payment-history.svg"
                        width={20}
                        height={20}
                        alt="Payment History"
                      />
                      Payment History
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/analytics">
                      <Image
                        src="/analytics.svg"
                        width={20}
                        height={20}
                        alt="Analytics"
                      />
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/activity-logs">
                      <Image
                        src="/activity-logs.svg"
                        width={20}
                        height={20}
                        alt="Activity Logs"
                      />
                      Activity Logs
                    </Link>
                  </li>
                </>
              )}
              {user.role === "user" && (
                <li className="my-1">
                  <Link href="/profile" className="justify-between">
                    Profile
                  </Link>
                </li>
              )}
              {/* <li>
                <a>Settings</a>
              </li> */}
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