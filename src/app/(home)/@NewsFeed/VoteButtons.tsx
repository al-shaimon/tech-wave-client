"use client";
import { useState } from "react";

interface VoteButtonsProps {
  initialVotes: number;
  commentsCount: number;
}

export default function VoteButtons({ initialVotes, commentsCount }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasUpVoted, setHasUpVoted] = useState(false);
  const [hasDownVoted, setHasDownVoted] = useState(false);
  const [hoverUpVote, setHoverUpVote] = useState(false);
  const [hoverDownVote, setHoverDownVote] = useState(false);

  const handleUpVote = () => {
    if (hasUpVoted) {
      // If already upVoted, clicking again removes the upvote
      setVotes(votes - 1);
      setHasUpVoted(false);
    } else {
      // If downVoted, remove the downVote first and add the upVote
      if (hasDownVoted) {
        setVotes(votes + 2); // Remove the downVote and add the upVote
        setHasDownVoted(false);
      } else {
        setVotes(votes + 1); // Just add the upVote
      }
      setHasUpVoted(true);
    }
  };

  const handleDownVote = () => {
    if (hasDownVoted) {
      // If already downVoted, clicking again removes the downVote
      setVotes(votes + 1);
      setHasDownVoted(false);
    } else {
      // If upVoted, remove the upVote first and add the downVote
      if (hasUpVoted) {
        setVotes(votes - 2); // Remove the upVote and add the downVote
        setHasUpVoted(false);
      } else {
        setVotes(votes - 1); // Just add the downVote
      }
      setHasDownVoted(true);
    }
  };

  return (
    <div className="mt-2 flex items-center text-white text-sm">
      <div
        className={`rounded-full px-3 py-1 flex items-center ${
          hasUpVoted ? 'bg-red-500' : hasDownVoted ? 'bg-blue-500' : 'bg-greyBg'
        }`}
      >
        {/* UpVote */}
        <div
          onClick={handleUpVote}
          onMouseEnter={() => setHoverUpVote(true)}
          onMouseLeave={() => setHoverUpVote(false)}
          className="cursor-pointer flex items-center"
        >
          <svg
            fill={hoverUpVote ? 'red' : 'currentColor'}
            height="16"
            icon-name="upvote-outline"
            viewBox="0 0 20 20"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path>
          </svg>
          <span className="ml-1">{votes}</span>
        </div>

        {/* DownVote */}
        <div
          onClick={handleDownVote}
          onMouseEnter={() => setHoverDownVote(true)}
          onMouseLeave={() => setHoverDownVote(false)}
          className="cursor-pointer flex items-center ml-4"
        >
          <svg
            fill={hoverDownVote ? '#3b82f6' : 'currentColor'}
            height="16"
            icon-name="downvote-outline"
            viewBox="0 0 20 20"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path>
          </svg>
        </div>
      </div>

      {/* Comment Section with Icon */}
      <div className="bg-greyBg px-3 py-1 rounded-full ml-4 cursor-pointer flex items-center">
        <svg
          aria-hidden="true"
          className="icon-comment"
          fill="currentColor"
          height="20"
          icon-name="comment-outline"
          viewBox="0 0 20 20"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.725 19.872a.718.718 0 0 1-.607-.328.725.725 0 0 1-.118-.397V16H3.625A2.63 2.63 0 0 1 1 13.375v-9.75A2.629 2.629 0 0 1 3.625 1h12.75A2.63 2.63 0 0 1 19 3.625v9.75A2.63 2.63 0 0 1 16.375 16h-4.161l-4 3.681a.725.725 0 0 1-.489.191ZM3.625 2.25A1.377 1.377 0 0 0 2.25 3.625v9.75a1.377 1.377 0 0 0 1.375 1.375h4a.625.625 0 0 1 .625.625v2.575l3.3-3.035a.628.628 0 0 1 .424-.165h4.4a1.377 1.377 0 0 0 1.375-1.375v-9.75a1.377 1.377 0 0 0-1.374-1.375H3.625Z"></path>
        </svg>
        <span className="ml-1">{commentsCount}</span>
      </div>

      {/* Share Section with Icon */}
      <div className="bg-greyBg px-3 py-1 rounded-full ml-4 cursor-pointer flex items-center">
        <svg
          aria-hidden="true"
          className="icon-share"
          fill="currentColor"
          height="20"
          icon-name="share-new-outline"
          viewBox="0 0 20 20"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m18.8 8.286-6.466-7.064a.759.759 0 0 0-1.295.537v3.277C5.623 5.365 1 9.918 1 15.082v2.907h1.274C2.516 15 5.81 12.62 9.834 12.62h1.205v3.226a.757.757 0 0 0 1.315.515l6.422-7.021A.756.756 0 0 0 19 8.8a.736.736 0 0 0-.2-.514Zm-6.508 6.3V12a.625.625 0 0 0-.625-.625H9.834A9.436 9.436 0 0 0 2.26 14.7c.228-4.536 4.525-8.435 9.4-8.435a.626.626 0 0 0 .625-.625V3.023L17.576 8.8l-5.284 5.786Zm5.586-6.107a.176.176 0 0 0-.023.024.171.171 0 0 1 .02-.028l.003.004Zm-.011.642a.53.53 0 0 0-.003-.004l.003.004Z"></path>
        </svg>
        <span className="ml-1">Share</span>
      </div>
    </div>
  );
}
