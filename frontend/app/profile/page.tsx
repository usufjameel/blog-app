'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/authStore'
import { blogApi } from '@/lib/api/client'
import { formatDate } from '@/lib/utils'
import { Edit, Trash2, Eye, Heart } from 'lucide-react'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  createdAt: string
  published: boolean
  views: number
  _count: {
    likes: number
    comments: number
  }
}

export default function Profile() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserBlogs()
    }
  }, [user])

  const fetchUserBlogs = async () => {
    try {
      const response = await blogApi.getBlogs({ author: user?.uid })
      setBlogs(response.data.blogs)
    } catch (error) {
      console.error('Error fetching user blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await blogApi.deleteBlog(blogId)
      setBlogs(blogs.filter(blog => blog.id !== blogId))
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  if (isLoading || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.displayName || 'User'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>{blogs.length} blogs</span>
              <span>{blogs.reduce((acc, blog) => acc + blog.views, 0)} total views</span>
              <span>{blogs.reduce((acc, blog) => acc + blog._count.likes, 0)} total likes</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Blogs</h2>
          <Link href="/create">
            <Button>Write New Blog</Button>
          </Link>
        </div>

        {blogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't written any blogs yet.</p>
              <Link href="/create">
                <Button>Write Your First Blog</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link href={`/blog/${blog.slug}`}>
                          <h3 className="text-lg font-semibold hover:underline">
                            {blog.title}
                          </h3>
                        </Link>
                        {!blog.published && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatDate(blog.createdAt)}</span>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {blog.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {blog._count.likes}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/edit/${blog.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBlog(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}