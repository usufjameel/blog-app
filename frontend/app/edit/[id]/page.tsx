'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { blogApi } from '@/lib/api/client'
import { BlogEditorV2 } from '@/components/blog/BlogEditorV2'

export default function EditBlog() {
  const { user, isLoading } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    if (blogId && user) {
      fetchBlog()
    }
  }, [user, isLoading, blogId, router])

  const fetchBlog = async () => {
    try {
      const response = await blogApi.getBlogById(blogId)
      const blogData = response.data
      
      if (blogData.author.email !== user?.email) {
        router.push('/')
        return
      }
      
      setBlog(blogData)
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user || !blog) {
    return null
  }

  return <BlogEditorV2 editMode={true} existingBlog={blog} />
}