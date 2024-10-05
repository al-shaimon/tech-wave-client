import React from "react";
import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">About TechWave</h1>
      <div className="flex flex-col items-center md:flex-row md:items-start">
        <Image
          src="/al-shaimon.jpg"
          alt="TechWave Team"
          width={400}
          height={300}
          className="mb-6 rounded-lg md:mb-0 md:mr-8"
        />
        <div className="text-center md:text-left">
          <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
          <p className="mb-4">
            At TechWave, our mission is to create a vibrant, inclusive community
            that empowers tech enthusiasts to learn, share, and innovate
            together. We strive to break down barriers in the tech industry by
            providing a platform where knowledge flows freely and collaboration
            knows no bounds.
          </p>
          <h2 className="mb-4 text-2xl font-semibold">Our Vision</h2>
          <p className="mb-4">
            We envision a world where technology is a force for positive change,
            driven by a diverse and passionate community. TechWave aims to be
            the catalyst for this change, fostering an ecosystem where ideas
            flourish, skills are honed, and the next generation of tech leaders
            emerges.
          </p>
          <h2 className="mb-4 text-2xl font-semibold">Our Team</h2>
          <p className="mb-4">
            TechWave was founded by a group of tech enthusiasts who saw the need
            for a more connected and collaborative tech community. Our team
            brings together expertise from various fields. We&apos;re united by
            our passion for technology and our belief in the power of
            community-driven innovation.
          </p>
        </div>
      </div>
    </div>
  );
}
