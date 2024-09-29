"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function Post() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 500;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      setText(e.target.value);
      adjustTextareaHeight();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div className="my-2 p-4">
      <div className="flex items-start">
        {/* Profile Picture */}
        <div className="mr-4">
          <Image
            className="rounded-full"
            src="/picture.jpg"
            width={48}
            height={48}
            alt="Profile"
          />
        </div>
        {/* Text Input Area */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            placeholder="What's happening?"
            value={text}
            onChange={handleInput}
            className="h-auto w-full resize-none overflow-hidden border-none bg-base-100 p-2 focus:outline-none"
            style={{ minHeight: "80px", maxHeight: "250px" }}
            maxLength={maxChars}
          />
          <div className="mt-2 flex justify-between">
            {/* Character Counter */}
            <div className="text-sm text-gray-500">
              {text.length}/{maxChars}
            </div>
            {/* Action Buttons */}
            <div className="text-gray-500">
              <button className="mr-2 text-blue-500">Photo</button>
              <button className="mr-2 text-blue-500">GIF</button>
            </div>
            {/* Post Button */}
            <button className="btn rounded-full bg-primary text-white">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
