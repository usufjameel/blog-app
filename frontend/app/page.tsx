"use client";

import { BlogList } from '@/components/blog/BlogList'
import { PopularBlogs } from '@/components/blog/PopularBlogs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { blogApi } from '@/lib/api/client'

export default function Home() {
  const { user } = useAuthStore();
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (user?.email) {
        try {
          const response = await blogApi.getBlogs({ author: user.email });
          setUserBlogs(response.data.blogs);
        } catch (error) {
          console.error('Error fetching user blogs:', error);
        }
      }
      setLoading(false);
    };

    fetchUserBlogs();
  }, [user]);

  const showWriteFirstBlog = user && !loading && userBlogs.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Technical Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Share your knowledge and learn from others
        </p>
        {showWriteFirstBlog && (
          <Link href="/create">
            <Button size="lg">Write Your First Blog</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Recent Blogs</h2>
          <BlogList />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-6">Popular Blogs</h2>
          <PopularBlogs />
        </div>
      </div>
    </div>
  )
}