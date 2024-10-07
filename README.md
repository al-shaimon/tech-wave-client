<div align="center">
  <h1>TechWave: Ride the Tide of Innovation 🌊</h1>
</div>

---

# RentRide

## Introduction

TechWave is your go-to social platform for tech enthusiasts, fostering a community where innovation thrives and technology trends are born. 🚀

## Project Description

TechWave is an innovative full-stack web application designed for tech enthusiasts to explore, share, and discover the latest tips, tutorials, and expert advice in the ever-evolving world of technology. Users can post about software, apps, gadgets, and digital tools while accessing personal experiences and user-generated content for practical tech solutions.

## Features

- **User Authentication & Profiles**: Secure login via email, personalized user profiles with posts, followers, and following. Verified users receive a badge.
- **Content Creation & Sharing**: Users can create tech tutorials and guides using a rich text editor, attach visuals, and categorize posts for easy discovery.
- **Upvote, Comment, & Follow System**: Engage with the community by upvoting, commenting, and following other users to stay updated on their tech insights.
- **Premium Content & Payment Integration**: Subscribe for $20/month to access exclusive tech content, with secure payments via Stripe
- **Search & Filter**: Advanced search with filters by category and relevance for easy access to specific tech tips.
- **News Feed & Infinite Scroll**: A dynamic news feed displaying the latest tech posts with infinite scrolling for seamless content browsing.
- **PDF Generation & Social Sharing**: Users can download tech guides as PDFs for offline access and share posts on social media platforms.
- **Admin Dashboard**: Admins can manage users, posts, and payment records, with the ability to block/unblock users and view analytics.

## Technology Stack

- **Frontend**: NextJS 14, TypeScript, Tailwind CSS, Daisy Ui
- **Backend**: Node.js, Express, Mongoose, TypeScript
- **API**: RESTful API
- **Database**: MongoDB

## Installation Guideline

Follow these steps to get the project running locally.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/al-shaimon/tech-wave-client.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```
3. **Create an .env.local file**:

   ```bash
   NODE_ENV=

   NEXT_PUBLIC_BASE_API=


   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_UPLOAD_PRESET=

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

With TechWave, users can seamlessly explore, share, and connect in the tech world while gaining access to expert insights and premium content. Join us in revolutionizing how tech enthusiasts learn, collaborate, and innovate.
