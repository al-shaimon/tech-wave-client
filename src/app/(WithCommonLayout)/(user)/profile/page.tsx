/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import dynamic from 'next/dynamic';

const ProfileContent = dynamic(() => import('./ProfileContent'), { ssr: false });

export default function Profile() {
  return <ProfileContent />;
}