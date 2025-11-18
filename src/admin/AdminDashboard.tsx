import { useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Editor } from 'primereact/editor'
import { TabView, TabPanel } from 'primereact/tabview'
import { Dialog } from 'primereact/dialog'
import './Admin.css'

type ContentItem = {
  _id?: string
  page: string
  section: string
  content: string
  tags?: string[]
  type: 'text' | 'list' | 'title' | 'tags'
  order?: number
}

type SocialLink = {
  icon: string
  href: string
  label: string
}

export function AdminDashboard({ onLogout, socialLinks: initialSocialLinks }: { onLogout: () => void; socialLinks: SocialLink[] }) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks)
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<{ type: string; data: any } | null>(null)

  const pages = ['home', 'about', 'resume', 'portfolio', 'contact', 'social']

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded content:', data)
        // Sort by order if available, otherwise by insertion order
        const sortedData = data.sort((a: ContentItem, b: ContentItem) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          return 0
        })
        setContent(sortedData)
      } else {
        console.error('Failed to load content:', response.status, response.statusText)
        setSaveStatus('Error loading content. Make sure server is running.')
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setSaveStatus('Error loading content. Make sure server is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }

  const updateContentOrder = async (_page: string, reorderedItems: ContentItem[]) => {
    try {
      const updates = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
      }))

      await Promise.all(
        updates.map((item) =>
          fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      )

      loadContent()
      window.dispatchEvent(new Event('contentUpdated'))
    } catch (error) {
      console.error('Error updating content order:', error)
      setSaveStatus('Error updating content order')
    }
  }

  const saveContent = async (item: ContentItem) => {
    setLoading(true)
    setSaveStatus('')
    try {
      const response = await fetch('/api/content', {
        method: item._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (response.ok) {
        setSaveStatus('Content saved successfully!')
        setEditing(null)
        loadContent()
        // Trigger page refresh to show updated content
        window.dispatchEvent(new Event('contentUpdated'))
        setTimeout(() => setSaveStatus(''), 3000)
      } else {
        setSaveStatus('Error saving content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setSaveStatus('Error saving content')
    } finally {
      setLoading(false)
    }
  }

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadContent()
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Button label="Logout" onClick={onLogout} className="admin-btn" />
      </div>

      {saveStatus && (
        <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
          {saveStatus}
        </div>
      )}

      {loading && <div className="loading-message">Loading content...</div>}

      {!loading && content.length === 0 && (
        <div className="no-content-message">
          No content found. Make sure server is running and database is initialized.
          <br />
          Run: <code>npm run server</code> in one terminal and <code>npm run init-db</code> if needed.
        </div>
      )}

      <TabView>
        {pages.map((page) => {
          if (page === 'social') {
            return (
              <TabPanel key="social" header="Social">
                <div className="admin-content-section">
                  <div className="admin-tab-header">
                    <div>
                      <h3>Social Media Links</h3>
                      <p className="page-text">Manage your social media links displayed in the sidebar.</p>
                    </div>
                    <Button
                      label="Save Changes"
                      onClick={() => {
                        setPendingChanges({ type: 'social', data: { socialLinks } })
                        setShowSaveDialog(true)
                      }}
                      className="admin-btn admin-btn-save"
                      icon="pi pi-save"
                    />
                  </div>
                  
                  <div className="social-links-admin">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="social-link-item">
                        <div className="social-link-icon">
                          <i className={link.icon} />
                        </div>
                        <div className="social-link-info">
                          <p className="social-link-label">{link.label}</p>
                          <p className="social-link-url">{link.href}</p>
                        </div>
                        <Button
                          label="Edit"
                          onClick={() => setEditingSocialLink(link)}
                          className="admin-btn-small"
                        />
                      </div>
                    ))}
                  </div>

                  {editingSocialLink && (
                    <div className="edit-form">
                      <h3>Edit Social Link</h3>
                      <div className="form-group">
                        <label>Platform</label>
                        <InputText
                          value={editingSocialLink.label}
                          disabled
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>URL</label>
                        <InputText
                          value={editingSocialLink.href}
                          onChange={(e) =>
                            setEditingSocialLink({ ...editingSocialLink, href: e.target.value })
                          }
                          className="form-input"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="form-actions">
                        <Button
                          label="Save"
                          onClick={() => {
                            const updated = socialLinks.map((link) =>
                              link.label === editingSocialLink.label ? editingSocialLink : link
                            )
                            setSocialLinks(updated)
                            setEditingSocialLink(null)
                          }}
                          className="admin-btn"
                        />
                        <Button
                          label="Cancel"
                          onClick={() => setEditingSocialLink(null)}
                          className="admin-btn-secondary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
            )
          }
          
          return (
            <TabPanel key={page} header={page.charAt(0).toUpperCase() + page.slice(1)}>
            <div className="admin-content-section">
              <div className="admin-tab-header">
                <Button
                  label="Add New Content"
                  onClick={() =>
                    setEditing({
                      page,
                      section: '',
                      content: '',
                      type: 'text',
                      tags: undefined,
                    })
                  }
                  className="admin-btn"
                />
                <Button
                  label="Save Changes"
                  onClick={() => {
                    setPendingChanges({ type: 'content', data: { page } })
                    setShowSaveDialog(true)
                  }}
                  className="admin-btn admin-btn-save"
                  icon="pi pi-save"
                />
              </div>

              {editing && editing.page === page && (
                <div className="edit-form">
                  <h3>Edit Content</h3>
                  <div className="form-group">
                    <label>Section</label>
                    <InputText
                      value={editing.section}
                      onChange={(e) =>
                        setEditing({ ...editing, section: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={editing.type}
                      onChange={(e) => {
                        const newType = e.target.value as 'text' | 'list' | 'title' | 'tags'
                        setEditing({
                          ...editing,
                          type: newType,
                          tags: newType === 'tags' ? (editing.tags || []) : undefined,
                        })
                      }}
                      className="form-input"
                    >
                      <option value="text">Text</option>
                      <option value="list">List</option>
                      <option value="title">Title</option>
                      <option value="tags">Tags</option>
                    </select>
                  </div>

                  {editing.type === 'tags' ? (
                    <div className="form-group">
                      <label>Tags (Drag to reorder)</label>
                      <div className="tags-input-container">
                        <div className="tags-display">
                          {editing.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="tag-chip"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move'
                                e.dataTransfer.setData('text/html', index.toString())
                                e.currentTarget.style.opacity = '0.5'
                              }}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.dataTransfer.dropEffect = 'move'
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.opacity = '1'
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                const draggedIndex = parseInt(e.dataTransfer.getData('text/html'))
                                const newTags = [...(editing.tags || [])]
                                const draggedTag = newTags[draggedIndex]
                                newTags.splice(draggedIndex, 1)
                                newTags.splice(index, 0, draggedTag)
                                setEditing({ ...editing, tags: newTags })
                              }}
                            >
                              <span className="tag-drag-handle">☰</span>
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  const newTags = editing.tags?.filter((_, i) => i !== index)
                                  setEditing({ ...editing, tags: newTags || [] })
                                }}
                                className="tag-remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="tags-input-wrapper">
                          <InputText
                            placeholder="Type tag and press Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                e.preventDefault()
                                const newTag = e.currentTarget.value.trim()
                                const currentTags = editing.tags || []
                                if (!currentTags.includes(newTag)) {
                                  setEditing({
                                    ...editing,
                                    tags: [...currentTags, newTag],
                                  })
                                  e.currentTarget.value = ''
                                }
                              }
                            }}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Content</label>
                      <Editor
                        value={editing.content}
                        onTextChange={(e) =>
                          setEditing({ ...editing, content: e.htmlValue || '' })
                        }
                        style={{ height: '400px' }}
                      />
                    </div>
                  )}
                  <div className="form-actions">
                    <Button
                      label="Save"
                      onClick={() => saveContent(editing)}
                      disabled={loading}
                      className="admin-btn"
                    />
                    <Button
                      label="Cancel"
                      onClick={() => setEditing(null)}
                      className="admin-btn-secondary"
                    />
                  </div>
                </div>
              )}

              <div className="content-list">
                {content
                  .filter((item) => item.page === page)
                  .length === 0 ? (
                  <p className="no-content-page">No content for this page yet.</p>
                ) : (
                  content
                    .filter((item) => item.page === page)
                    .map((item, _index, array) => {
                      const pageItems = array.filter((i) => i.page === page)
                      const itemIndex = pageItems.indexOf(item)
                      return (
                        <div
                          key={item._id || Math.random()}
                          className={`content-item ${draggedItem === itemIndex ? 'dragging' : ''}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/html', itemIndex.toString())
                            setDraggedItem(itemIndex)
                            e.currentTarget.style.opacity = '0.5'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                            const target = e.currentTarget
                            const rect = target.getBoundingClientRect()
                            const midY = rect.top + rect.height / 2
                            if (e.clientY < midY) {
                              target.classList.add('drag-over-top')
                              target.classList.remove('drag-over-bottom')
                            } else {
                              target.classList.add('drag-over-bottom')
                              target.classList.remove('drag-over-top')
                            }
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom')
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom')
                            setDraggedItem(null)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const draggedIndex = parseInt(e.dataTransfer.getData('text/html'))
                            const pageItems = content.filter((i) => i.page === page)
                            const newOrder = [...pageItems]
                            const draggedItem = newOrder[draggedIndex]
                            newOrder.splice(draggedIndex, 1)
                            newOrder.splice(itemIndex, 0, draggedItem)
                            
                            // Update all items with new order
                            const allContent = content.filter((i) => i.page !== page)
                            const reorderedContent = [...allContent, ...newOrder]
                            setContent(reorderedContent)
                            updateContentOrder(page, newOrder)
                            
                            e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom')
                          }}
                        >
                          <div className="content-item-handle">☰</div>
                          <div className="content-item-body">
                            <h4>{item.section || 'No section'}</h4>
                            <p className="content-type">Type: {item.type}</p>
                            {item.type === 'tags' && item.tags ? (
                              <div className="tags-preview">
                                {item.tags.map((tag, idx) => (
                                  <span key={idx} className="tag-chip-preview">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="content-preview">
                                {item.content && item.content.length > 100
                                  ? `${item.content.substring(0, 100)}...`
                                  : item.content || 'No content'}
                              </p>
                            )}
                            <div className="content-actions">
                              <Button
                                label="Edit"
                                onClick={() => setEditing(item)}
                                className="admin-btn-small"
                              />
                              <Button
                                label="Delete"
                                onClick={() => item._id && deleteContent(item._id)}
                                className="admin-btn-small admin-btn-danger"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </TabPanel>
          )
        })}
      </TabView>

      <Dialog
        header="Save Changes"
        visible={showSaveDialog}
        style={{ width: '450px' }}
        onHide={() => setShowSaveDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowSaveDialog(false)
                setPendingChanges(null)
              }}
              className="admin-btn-secondary"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={() => {
                if (pendingChanges?.type === 'social') {
                  localStorage.setItem('socialLinks', JSON.stringify(pendingChanges.data.socialLinks))
                  window.dispatchEvent(new Event('socialLinksUpdated'))
                  setSaveStatus('Social links saved successfully!')
                } else if (pendingChanges?.type === 'content') {
                  // Content changes are already saved individually, just confirm
                  setSaveStatus('All changes saved successfully!')
                }
                setShowSaveDialog(false)
                setPendingChanges(null)
                setTimeout(() => setSaveStatus(''), 3000)
              }}
              className="admin-btn"
              autoFocus
            />
          </div>
        }
      >
        <div className="save-dialog-content">
          <p>Are you sure you want to save all changes?</p>
          {pendingChanges?.type === 'social' && (
            <p className="save-dialog-details">This will update all social media links in the sidebar.</p>
          )}
          {pendingChanges?.type === 'content' && (
            <p className="save-dialog-details">This will save all content changes for this page.</p>
          )}
        </div>
      </Dialog>
    </div>
  )
}

