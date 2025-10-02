'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { blogApi } from '@/lib/api/client'
import { Eye, Heart } from 'lucide-react'

interface Blog {
  id: string
  title: string
  slug: string
  views: number
  _count: {
    likes: number
  }
}

export function PopularBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularBlogs()
  }, [])

  const fetchPopularBlogs = async () => {
    try {
      const response = await blogApi.getPopularBlogs(5)
      setBlogs(response.data)
    } catch (error) {
      console.error('Error fetching popular blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trending</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {blogs.map((blog, index) => (
          <div key={blog.id} className="flex items-start space-x-3">
            <span className="text-2xl font-bold text-muted-foreground">
              {index + 1}
            </span>
            <div className="flex-1">
              <Link href={`/blog/${blog.slug}`} className="hover:underline">
                <h3 className="font-medium line-clamp-2 mb-1">{blog.title}</h3>
              </Link>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {blog.views}
                </div>
                <div className="flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  {blog._count.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}