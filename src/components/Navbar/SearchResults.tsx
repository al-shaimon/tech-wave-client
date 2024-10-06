import Link from "next/link";
import Image from "next/image";
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

interface SearchResult {
  _id: string;
  content: string;
  user: {
    name: string;
    profilePhoto: string;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: () => void;
}

export default function SearchResults({ results, onResultClick }: SearchResultsProps) {
  const sanitizeAndTruncate = (html: string, maxLength: number) => {
    const clean = DOMPurify.sanitize(html);
    const truncated = clean.length > maxLength ? clean.substr(0, maxLength - 1) + "..." : clean;
    return parse(truncated);
  };

  return (
    <div className="absolute top-full left-0 w-full bg-base-200 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {results.map((result) => (
        <Link href={`/post/${result._id}`} key={result._id} onClick={onResultClick}>
          <div className="flex items-center p-2 hover:bg-base-300 cursor-pointer">
            <Image
              src={result.user.profilePhoto}
              alt={result.user.name}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
            <div>
              <p className="font-semibold">{result.user.name}</p>
              <div className="text-sm text-gray-500">
                {sanitizeAndTruncate(result.content, 50)}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
