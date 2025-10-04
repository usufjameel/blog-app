"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { blogApi } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import { Heart, Eye, Share2, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { CommentSection } from "@/components/blog/CommentSection";
import { BlogContent } from "@/components/blog/BlogContent";

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await blogApi.getBlog(slug);
      setBlog(response.data);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !blog) return;

    setLiking(true);
    try {
      const response = await blogApi.likeBlog(blog.id);
      setBlog((prev) =>
        prev
          ? {
              ...prev,
              isLiked: response.data.liked,
              _count: {
                ...prev._count,
                likes: response.data.liked
                  ? prev._count.likes + 1
                  : prev._count.likes - 1,
              },
            }
          : null
      );
    } catch (error) {
      console.error("Error liking blog:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!blog) {
    return <div className="text-center py-8">Blog not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={blog.author.avatar} />
                <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{blog.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(blog.createdAt)}
                  {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                    <span className="ml-2 text-xs text-gray-500">(Edited)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {blog.views}
              </div>

              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={liking}
                  className={blog.isLiked ? "text-red-500" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 ${
                      blog.isLiked ? "fill-current" : ""
                    }`}
                  />
                  {blog._count.likes}
                </Button>
              )}

              {user?.email === blog.author.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/edit/${blog.id}`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {blog.coverImage && (
            <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${blog.coverImage}`}
                alt={blog.title}
                className="object-cover"
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none mb-12">
          <BlogContent content={blog.content} />
        </div>

        <CommentSection blogId={blog.id} />
      </article>
    </div>
  );
}
