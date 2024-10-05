/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Here you would typically send the form data to your backend
    // For this example, we'll just simulate an API call
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear the form
      setFormData({ name: "", email: "", message: "" });
      toast.success("Your message has been sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Contact Us</h1>
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-center">
          We&apos;d love to hear from you! Whether you have a question about our platform, need technical support, or want to explore partnership opportunities, our team is here to help.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full" 
              required 
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full" 
              required 
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block">Message</label>
            <textarea 
              id="message" 
              name="message" 
              rows={4} 
              value={formData.message}
              onChange={handleChange}
              className="textarea textarea-bordered w-full" 
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="btn bg-primary text-white w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">Other Ways to Reach Us</h2>
          <p>Email: contact@techwave.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Tech Street, Silicon Valley, CA 94000</p>
        </div>
      </div>
    </div>
  );
}
