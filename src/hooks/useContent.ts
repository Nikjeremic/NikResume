import { useState, useEffect } from 'react'

type ContentItem = {
  _id?: string
  page: string
  section: string
  content: string
  tags?: string[]
  type: 'text' | 'list' | 'title' | 'tags'
  order?: number
}

export function useContent(page: string) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        const pageContent = data
          .filter((item: ContentItem) => item.page === page)
          .sort((a: ContentItem, b: ContentItem) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order
            }
            return 0
          })
        setContent(pageContent)
      }
      } catch (error) {
        console.error('Error loading content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()

    // Listen for content updates
    const handleContentUpdate = () => {
      loadContent()
    }
    window.addEventListener('contentUpdated', handleContentUpdate)

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate)
    }
  }, [page])

  return { content, loading }
}

