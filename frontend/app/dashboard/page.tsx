"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { blogApi } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: string;
  published: boolean;
  views: number;
  _count: {
    likes: number;
    comments: number;
  };
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      fetchUserBlogs();
    }
  }, [user]);

  const fetchUserBlogs = async () => {
    try {
      const response = await blogApi.getBlogs({ author: user?.email });
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await blogApi.deleteBlog(blogId);
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
      toast({ title: "Blog deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting blog", variant: "destructive" });
    }
  };

  const handleUnpublish = async (blogId: string) => {
    if (!confirm("Are you sure you want to unpublish this blog?")) return;

    try {
      await blogApi.updateBlog(blogId, { published: false });
      setBlogs(blogs.map(blog => 
        blog.id === blogId ? { ...blog, published: false } : blog
      ));
      toast({ title: "Blog unpublished successfully" });
    } catch (error) {
      toast({ title: "Error unpublishing blog", variant: "destructive" });
    }
  };

  if (!user) {
    return <div className="text-center py-8">Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return <div className="text-center py-8">Loading your blogs...</div>;
  }

  const publishedBlogs = blogs.filter((blog) => blog.published);
  const draftBlogs = blogs.filter((blog) => !blog.published);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Link href="/create">
          <Button>Create New Blog</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Draft Blogs ({draftBlogs.length})</h2>
          <div className="space-y-4">
            {draftBlogs.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/edit/${blog.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{getDisplayText(blog)}</p>
                </CardContent>
              </Card>
            ))}
            {draftBlogs.length === 0 && (
              <p className="text-muted-foreground">No draft blogs yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Published Blogs ({publishedBlogs.length})</h2>
          <div className="space-y-4">
            {publishedBlogs.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        <Link href={`/blog/${blog.slug}`} className="hover:underline">
                          {blog.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="default">Published</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/blog/${blog.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/edit/${blog.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnpublish(blog.id)}
                        title="Unpublish"
                      >
                        <EyeOff className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-2">{getDisplayText(blog)}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{blog._count.likes} likes</span>
                    <span>{blog._count.comments} comments</span>
                    <span>{blog.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {publishedBlogs.length === 0 && (
              <p className="text-muted-foreground">No published blogs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}