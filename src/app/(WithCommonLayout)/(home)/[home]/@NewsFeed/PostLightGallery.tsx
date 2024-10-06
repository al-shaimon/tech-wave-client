// components/PostLightGallery.tsx
"use client";

import LightGallery from "lightgallery/react";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import Image from "next/image";
import Link from "next/link";

interface PostLightGalleryProps {
  images: string[];
}

export default function PostLightGallery({ images }: PostLightGalleryProps) {
  return (
    <LightGallery
      elementClassNames={`mt-2 ${
        images.length === 1 ? "w-full" : "grid grid-cols-1 gap-2 sm:grid-cols-2"
      }`}
      speed={500}
      plugins={[lgThumbnail, lgZoom]}
    >
      {images.map((image, index) => (
        <Link key={index} href={image}>
          <div className="relative hidden h-[500px] w-full md:block">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <div className="relative h-64 md:hidden md:h-96">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        </Link>
      ))}
    </LightGallery>
  );
}
