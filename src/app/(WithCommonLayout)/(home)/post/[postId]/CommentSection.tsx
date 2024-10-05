/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import envConfig from "@/config/envConfig";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface CommentSectionProps {
  postId: string;
  onCommentUpdate: () => void;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePhoto: string;
  };
  createdAt: string;
}

export default function CommentSection({ postId, onCommentUpdate }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const quillRef = useRef<any>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `${envConfig.baseApi}/comments/post/${postId}`,
      );
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments.");
    }
  }, [postId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: { id: string } = jwtDecode(token);
      setUserId(decodedToken.id);
    }

    fetchComments();
  }, [postId, fetchComments]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${envConfig.baseApi}/comments`,
        {
          content: newComment,
          user: userId,
          post: postId,
        },
        {
          headers: { Authorization: `${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Comment added successfully");
        setNewComment("");
        fetchComments();
        onCommentUpdate(); // Call this after adding a comment
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment.");
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editedContent.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${envConfig.baseApi}/comments/${commentId}`,
        { content: editedContent },
        { headers: { Authorization: `${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment updated successfully");
        setEditingCommentId(null);
        setEditedContent("");
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${envConfig.baseApi}/comments/${commentId}`,
        { headers: { Authorization: `${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment deleted successfully");
        fetchComments();
        onCommentUpdate(); // Call this after deleting a comment
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.");
    }
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

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Comments ({comments.length})</h2>
      <div className="mb-4">
        <div className="quill-wrapper">
          <ReactQuill
            value={newComment}
            onChange={setNewComment}
            modules={quillModules}
            formats={quillFormats}
            className="custom-quill mb-4 text-white"
            theme="snow"
          />
        </div>
        <button
          onClick={handleCommentSubmit}
          className="btn bg-primary px-4 py-2 text-white hover:bg-blue-600"
        >
          Post Comment
        </button>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="rounded bg-base-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={comment.user.profilePhoto}
                  alt={comment.user.name}
                  width={40}
                  height={40}
                  className="mr-2 rounded-full"
                />
                <div>
                  <p className="font-bold">{comment.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {userId === comment.user._id && (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                  </label>
                  <ul tabIndex={0} className="mt-3 p-2 z-[1] shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                    <li><a onClick={() => {
                      setEditingCommentId(comment._id);
                      setEditedContent(comment.content);
                    }}>Edit</a></li>
                    <li><a onClick={() => handleDeleteComment(comment._id)}>Delete</a></li>
                  </ul>
                </div>
              )}
            </div>
            {editingCommentId === comment._id ? (
              <div>
                <ReactQuill
                  value={editedContent}
                  onChange={setEditedContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="custom-quill mb-4 text-white"
                  theme="snow"
                />
                <button
                  onClick={() => handleUpdateComment(comment._id)}
                  className="btn bg-primary px-4 py-2 text-white hover:bg-blue-600 mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="btn bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <ReactMarkdown
                  className="prose-sm text-white md:prose-lg prose-h1:text-2xl prose-h2:text-xl prose-p:text-sm md:prose-h1:text-4xl md:prose-h2:text-3xl md:prose-p:text-[15px]"
                  rehypePlugins={[rehypeRaw]}
                >
                  {comment.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}