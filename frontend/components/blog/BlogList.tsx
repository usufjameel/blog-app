"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogApi } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: string;
  views: number;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const getDisplayText = (blog: Blog) => {
    if (blog.excerpt) return blog.excerpt;
    if (blog.content) {
      try {
        const sections = JSON.parse(blog.content);
        const textContent = sections
          .filter((s: any) => s.type === 'text' || s.type === 'header' || s.type === 'subheader')
          .map((s: any) => s.content)
          .join(' ')
          .replace(/<[^>]*>/g, '')
          .substring(0, 200);
        return textContent + (textContent.length === 200 ? '...' : '');
      } catch {
        return '';
      }
    }
    return '';
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (pageNum = 1) => {
    try {
      const response = await blogApi.getBlogs({ page: pageNum, limit: 10 });
      const { blogs: newBlogs, pages } = response.data;

      if (pageNum === 1) {
        setBlogs(newBlogs);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
      }

      setHasMore(pageNum < pages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchBlogs(page + 1);
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await blogApi.deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      toast({ title: 'Blog deleted successfully' });
    } catch (error) {
      toast({ title: 'Error deleting blog', variant: 'destructive' });
    }
  };

  const handleEdit = (blogId: string) => {
    window.location.href = `/edit/${blogId}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      {blogs.map((blog) => (
        <Card key={blog.id} className="overflow-hidden">
          <div className="flex items-stretch">
            {blog.coverImage && (
              <div className="w-48 h-full relative flex-shrink-0">
                <img
                  src={`http://localhost:4000${blog.coverImage}`}
                  alt={blog.title}
                  className="size-48 object-center object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2 flex-1">
                    <Link href={`/blog/${blog.slug}`} className="hover:underline">
                      {blog.title}
                    </Link>
                  </CardTitle>
                  {user?.email === blog.author.email && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(blog.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{blog.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {getDisplayText(blog)}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {blog._count.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {blog._count.comments}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {blog.views}
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
