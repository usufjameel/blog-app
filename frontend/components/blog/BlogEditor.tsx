'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadApi, blogApi } from '@/lib/api/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Upload, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'

interface BlogEditorProps {
  initialData?: {
    id?: string
    title: string
    content: string
    excerpt?: string
    coverImage?: string
    published: boolean
  }
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')
  const [published, setPublished] = useState(initialData?.published || false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('Uploading file:', file.name, file.type, file.size)
    setLoading(true)
    
    try {
      const response = await uploadApi.uploadImage(file)
      console.log('Upload response:', response)
      setCoverImage(response.data.url)
      toast({ title: 'Image uploaded successfully' })
    } catch (error: any) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response)
      toast({ title: error.response?.data?.message || 'Error uploading image', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (publishNow = false) => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const blogData = {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        coverImage,
        published: publishNow,
      }

      if (initialData?.id) {
        await blogApi.updateBlog(initialData.id, blogData)
        toast({ title: 'Blog updated successfully' })
      } else {
        await blogApi.createBlog(blogData)
        toast({ title: 'Blog created successfully' })
      }

      router.push('/')
    } catch (error) {
      toast({ title: 'Error saving blog', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {initialData?.id ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {preview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={loading}
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold"
          />

          <Input
            placeholder="Brief excerpt (optional)..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="cover-upload"
              />
              <label htmlFor="cover-upload">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {loading ? 'Uploading...' : 'Upload Cover'}
                  </span>
                </Button>
              </label>
              {coverImage && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Image uploaded
                  </span>
                  <img 
                    src={`http://localhost:4000${coverImage}`} 
                    alt="Cover preview" 
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {preview ? (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h1>{title || 'Blog Title'}</h1>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypePrism]}
                  >
                    {content || 'Your blog content will appear here...'}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Textarea
              placeholder="Write your blog content in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] font-mono"
            />
          )}
        </div>
      </div>
    </div>
  )
}