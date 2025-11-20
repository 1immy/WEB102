import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

const FLAG_OPTIONS = ['Tip', 'Question', 'Opinion', 'Brag', 'Event']
const THEME_OPTIONS = [
  { id: 'midnight', label: 'Midnight Alley' },
  { id: 'sunset', label: 'Sunset Split' },
  { id: 'retro', label: 'Retro Lanes' },
]

const EMPTY_POST_FORM = {
  title: '',
  content: '',
  image_url: '',
  flag: FLAG_OPTIONS[0],
  reference_post_id: '',
}

const STORAGE_KEYS = {
  userId: 'bowling-user-id',
  theme: 'bowling-theme',
  extras: 'bowling-feed-show-extras',
}

const Spinner = ({ label }) => (
  <div className="spinner" role="status" aria-live="polite">
    <div className="spinner-ball" />
    {label && <p>{label}</p>}
  </div>
)

const PostCard = ({ post, onSelect, onQuickReference, showExtras }) => (
  <article className="post-card" onClick={() => onSelect(post.id)}>
    <header>
      <p className="flag">{post.flag || 'Unflagged'}</p>
      <p className="timestamp">{new Date(post.created_at).toLocaleString()}</p>
    </header>
    <h3>{post.title}</h3>
    {showExtras && post.content && <p className="preview">{post.content}</p>}
    {showExtras && post.image_url && (
      <img src={post.image_url} alt={post.title} className="preview-image" />
    )}
    <footer>
      <p className="meta">
        <strong>{post.upvotes ?? 0}</strong> upvotes ·{' '}
        <strong>{post.comment_count ?? 0}</strong> comments
      </p>
      <button
        className="ghost-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onQuickReference(post)
        }}
      >
        Comment
      </button>
    </footer>
  </article>
)

function App() {
  const [userId, setUserId] = useState('')
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isDetailView, setIsDetailView] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newPost, setNewPost] = useState(EMPTY_POST_FORM)
  const [editForm, setEditForm] = useState(EMPTY_POST_FORM)
  const [newComment, setNewComment] = useState('')
  const [newCommentImage, setNewCommentImage] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [flagFilter, setFlagFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [showExtras, setShowExtras] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.extras)
    return stored ? stored === 'true' : false
  })
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'midnight')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const supabaseReady = Boolean(supabase)

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.userId)
    if (storedId) {
      setUserId(storedId)
      return
    }
    const generatedId = `bowler-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(STORAGE_KEYS.userId, generatedId)
    setUserId(generatedId)
  }, [])

  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.extras, showExtras ? 'true' : 'false')
  }, [showExtras])

  const formatPost = useCallback((post) => {
    if (!post) return post
    const commentCount = post.comments?.[0]?.count ?? post.comment_count ?? 0
    const { comments: _comments, ...rest } = post
    return { ...rest, comment_count: commentCount }
  }, [])

  const fetchPosts = useCallback(async () => {
    if (!supabase) {
      setErrorMessage('Add your Supabase credentials to load data.')
      return
    }
    setPostsLoading(true)
    setErrorMessage('')
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments:comments(count)')
      .order('created_at', { ascending: false })
    if (error) {
      setErrorMessage('Unable to load posts right now.')
      setPosts([])
    } else {
      const normalized = (data || []).map((post) => formatPost(post))
      setPosts(normalized)
    }
    setPostsLoading(false)
  }, [formatPost])

  const fetchComments = useCallback(async (postId) => {
    if (!supabase) {
      return
    }
    setCommentsLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (error) {
      setErrorMessage('Unable to load comments right now.')
      setComments([])
    } else {
      setComments(data || [])
    }
    setCommentsLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(() => {
    const filterBySearch = (post) =>
      post.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    const filterByFlag = (post) => (flagFilter === 'all' ? true : post.flag === flagFilter)
    const sorted = [...posts]
    sorted.sort((a, b) => {
      if (sortBy === 'upvotes') {
        return (b.upvotes || 0) - (a.upvotes || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return sorted.filter(filterBySearch).filter(filterByFlag)
  }, [posts, searchQuery, flagFilter, sortBy])

  const referencedPost = useMemo(() => {
    if (!selectedPost?.reference_post_id) return null
    return posts.find((post) => String(post.id) === String(selectedPost.reference_post_id)) || null
  }, [posts, selectedPost])

  const handleCreatePost = async (event) => {
    event.preventDefault()
    setStatusMessage('')
    setErrorMessage('')
    if (!supabase) {
      setErrorMessage('Set up Supabase to create posts.')
      return
    }
    if (!newPost.title.trim()) {
      setErrorMessage('Please add a title to your post.')
      return
    }
    setIsPosting(true)
    const payload = {
      title: newPost.title.trim(),
      content: newPost.content.trim() || null,
      image_url: newPost.image_url.trim() || null,
      flag: newPost.flag,
      reference_post_id: newPost.reference_post_id.trim() || null,
      author_id: userId,
      upvotes: 0,
    }
    const { data, error } = await supabase.from('posts').insert([payload]).select().single()
    if (error) {
      setErrorMessage('Unable to save your post.')
    } else {
      setPosts((prev) => [{ ...data, comment_count: 0 }, ...prev])
      setNewPost(EMPTY_POST_FORM)
      setStatusMessage('Post shared to the alley!')
    }
    setIsPosting(false)
  }

  const openPost = async (postId) => {
    if (!supabase) return
    setDetailLoading(true)
    setErrorMessage('')
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments:comments(count)')
      .eq('id', postId)
      .single()
    if (error) {
      setErrorMessage('Unable to open that post.')
    } else {
      const normalized = formatPost(data)
      setSelectedPost(normalized)
      setEditForm({
        title: normalized.title || '',
        content: normalized.content || '',
        image_url: normalized.image_url || '',
        flag: normalized.flag || FLAG_OPTIONS[0],
        reference_post_id: normalized.reference_post_id || '',
      })
      setIsDetailView(true)
      setIsEditing(false)
      fetchComments(postId)
    }
    setDetailLoading(false)
  }

  const closePost = () => {
    setSelectedPost(null)
    setComments([])
    setIsDetailView(false)
    setIsEditing(false)
  }

  const handleUpvote = async (post) => {
    if (!supabase) return
    setErrorMessage('')
    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: (post.upvotes || 0) + 1 })
      .eq('id', post.id)
      .select()
      .single()
    if (error) {
      setErrorMessage('Unable to register your upvote.')
      return
    }
    const updated = { ...data, comment_count: post.comment_count || 0 }
    setPosts((prev) => prev.map((item) => (item.id === post.id ? updated : item)))
    if (selectedPost?.id === post.id) {
      setSelectedPost(updated)
    }
  }

  const handleAddComment = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    if (!selectedPost || !supabase) return
    if (!newComment.trim()) return
    const payload = {
      body: newComment.trim(),
      author_id: userId,
      post_id: selectedPost.id,
      image_url: newCommentImage.trim() || null,
    }
    const { data, error } = await supabase.from('comments').insert([payload]).select().single()
    if (error) {
      setErrorMessage('Unable to add your comment.')
    } else {
      setComments((prev) => [...prev, data])
      setNewComment('')
      setNewCommentImage('')
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post,
        ),
      )
      setSelectedPost((prev) =>
        prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev,
      )
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!supabase) return
    await supabase.from('comments').delete().eq('id', commentId)
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost?.id
          ? { ...post, comment_count: Math.max((post.comment_count || 1) - 1, 0) }
          : post,
      ),
    )
    setSelectedPost((prev) =>
      prev ? { ...prev, comment_count: Math.max((prev.comment_count || 1) - 1, 0) } : prev,
    )
  }

  const isAuthor = selectedPost && selectedPost.author_id === userId

  const handleUpdatePost = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    if (!selectedPost || !supabase) return
    if (!editForm.title.trim()) {
      setErrorMessage('Title cannot be empty.')
      return
    }
    setIsUpdating(true)
    const payload = {
      title: editForm.title.trim(),
      content: editForm.content.trim() || null,
      image_url: editForm.image_url.trim() || null,
      flag: editForm.flag,
      reference_post_id: editForm.reference_post_id.trim() || null,
    }
    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', selectedPost.id)
      .select()
      .single()
    if (error) {
      setErrorMessage('Unable to update the post.')
    } else {
      const updated = { ...data, comment_count: selectedPost.comment_count || 0 }
      setPosts((prev) => prev.map((post) => (post.id === data.id ? updated : post)))
      setSelectedPost(updated)
      setIsEditing(false)
      setStatusMessage('Post updated successfully.')
    }
    setIsUpdating(false)
  }

  const handleDeletePost = async () => {
    if (!selectedPost || !supabase) return
    setErrorMessage('')
    const confirmed = window.confirm('Delete this post? This cannot be undone.')
    if (!confirmed) return
    setIsDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', selectedPost.id)
    if (error) {
      setErrorMessage('Unable to delete the post.')
    } else {
      setStatusMessage('Post removed from the alley.')
      closePost()
      fetchPosts()
    }
    setIsDeleting(false)
  }

  const handleQuickReference = (post) => {
    setNewPost({
      title: `Re: ${post.title}`,
      content: '',
      image_url: post.image_url || '',
      flag: post.flag || FLAG_OPTIONS[0],
      reference_post_id: post.id,
    })
    setStatusMessage(`Referencing post #${post.id} in your create form.`)
  }

  const detailActions = (
    <div className="detail-actions">
      <button className="ghost-button" type="button" onClick={() => handleUpvote(selectedPost)}>
        Upvote ({selectedPost?.upvotes ?? 0})
      </button>
      <p className="detail-comments-count">
        {selectedPost?.comment_count ?? 0} comments
      </p>
      {isAuthor && !isEditing && (
        <>
          <button className="ghost-button" type="button" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={handleDeletePost}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="hero">
        <div className="hero-title">
          <h1>Bowlerz Hub</h1>
        </div>
        <div className="hero-controls">
          <p className="user-id">
            You are <span>{userId || 'setting up...'}</span>
          </p>
          <label>
            Theme
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              {THEME_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="content-shell">
        {!supabaseReady && (
          <section className="warning">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to load real data.
          </section>
        )}

        {statusMessage && <p className="status-message">{statusMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {isDetailView && selectedPost ? (
          <section className="detail-view">
            <button className="ghost-button back-button" type="button" onClick={closePost}>
              ← Back to feed
            </button>
            {detailLoading ? (
              <Spinner label="Loading post..." />
            ) : (
              <article className="post-detail">
                <header>
                  <p className="flag">{selectedPost.flag}</p>
                  <p className="timestamp">{new Date(selectedPost.created_at).toLocaleString()}</p>
                  <h2>{selectedPost.title}</h2>
                  <p className="author">Posted by {selectedPost.author_id}</p>
                </header>
                {!isEditing ? (
                  <>
                    <p className="content">{selectedPost.content || 'No additional content.'}</p>
                    {selectedPost.image_url && (
                      <img
                        src={selectedPost.image_url}
                        alt={selectedPost.title}
                        className="detail-image"
                      />
                    )}
                    {selectedPost.reference_post_id && (
                      <div className="reference-card">
                        <p>Reference Post</p>
                        {referencedPost ? (
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => openPost(referencedPost.id)}
                          >
                            #{referencedPost.id} · {referencedPost.title}
                          </button>
                        ) : (
                          <p>#{selectedPost.reference_post_id}</p>
                        )}
                      </div>
                    )}
                    {detailActions}
                  </>
                ) : (
                  <form className="stack-form" onSubmit={handleUpdatePost}>
                    <label>
                      Title
                      <input
                        value={editForm.title}
                        onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Content
                      <textarea
                        value={editForm.content}
                        onChange={(event) => setEditForm({ ...editForm, content: event.target.value })}
                      />
                    </label>
                    <label>
                      Image or video URL
                      <input
                        value={editForm.image_url}
                        onChange={(event) => setEditForm({ ...editForm, image_url: event.target.value })}
                        placeholder="https://"
                      />
                    </label>
                    <label>
                      Flag
                      <select
                        value={editForm.flag}
                        onChange={(event) => setEditForm({ ...editForm, flag: event.target.value })}
                      >
                        {FLAG_OPTIONS.map((flag) => (
                          <option key={flag} value={flag}>
                            {flag}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Reference Post ID
                      <input
                        value={editForm.reference_post_id}
                        onChange={(event) =>
                          setEditForm({ ...editForm, reference_post_id: event.target.value })
                        }
                        placeholder="Optional"
                      />
                    </label>
                    <div className="form-actions">
                      <button type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save changes'}
                      </button>
                      <button type="button" className="ghost-button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <section className="comments">
                  <h3>Comments</h3>
                  {commentsLoading ? (
                    <Spinner label="Loading comments..." />
                  ) : (
                    <ul>
                    {comments.map((comment) => (
                      <li key={comment.id}>
                        <div>
                          <p>{comment.body}</p>
                          <p className="comment-meta">
                            {comment.author_id} · {new Date(comment.created_at).toLocaleString()}
                          </p>
                          {comment.image_url && (
                            <img
                              src={comment.image_url}
                              alt="Comment attachment"
                              className="comment-image"
                            />
                          )}
                        </div>
                        {comment.author_id === userId && (
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </button>
                          )}
                        </li>
                      ))}
                      {comments.length === 0 && <p>No comments yet. Drop the first tip!</p>}
                    </ul>
                  )}
                <form className="comment-form" onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Share advice or congrats..."
                  />
                  <input
                    type="url"
                    value={newCommentImage}
                    onChange={(event) => setNewCommentImage(event.target.value)}
                    placeholder="Optional image URL"
                  />
                  <button type="submit" disabled={!newComment.trim()}>
                    Add comment
                  </button>
                </form>
                </section>
              </article>
            )}
          </section>
        ) : (
          <div className="layout">
            <section className="panel feed-panel">
              <div className="feed-controls">
                <input
                  type="search"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <select value={flagFilter} onChange={(event) => setFlagFilter(event.target.value)}>
                  <option value="all">All flags</option>
                  {FLAG_OPTIONS.map((flag) => (
                    <option key={flag} value={flag}>
                      {flag}
                    </option>
                  ))}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="created_at">Newest first</option>
                  <option value="upvotes">Top upvotes</option>
                </select>
              </div>

              {postsLoading ? (
                <Spinner label="Fetching posts..." />
              ) : (
                <div className="posts-grid">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      showExtras={showExtras}
                      onSelect={openPost}
                      onQuickReference={handleQuickReference}
                    />
                  ))}
                  {filteredPosts.length === 0 && (
                    <p className="empty-state">No posts match your filters yet.</p>
                  )}
                </div>
              )}
            </section>

            <section className="panel form-panel">
              <h2>Create a post</h2>
              <form className="stack-form" onSubmit={handleCreatePost}>
                <label>
                  Title*
                  <input
                    value={newPost.title}
                    onChange={(event) => setNewPost({ ...newPost, title: event.target.value })}
                    required
                  />
                </label>
                <label>
                  What happened?
                  <textarea
                    value={newPost.content}
                    onChange={(event) => setNewPost({ ...newPost, content: event.target.value })}
                    placeholder="Share lane conditions, gear setups, or scoring tips."
                  />
                </label>
                <label>
                  Image or video URL
                  <input
                    value={newPost.image_url}
                    onChange={(event) => setNewPost({ ...newPost, image_url: event.target.value })}
                    placeholder="https://example.com/high-game.jpg"
                  />
                </label>
                <label>
                  Flag
                  <select
                    value={newPost.flag}
                    onChange={(event) => setNewPost({ ...newPost, flag: event.target.value })}
                  >
                    {FLAG_OPTIONS.map((flag) => (
                      <option key={flag} value={flag}>
                        {flag}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Reference Post ID
                  <input
                    value={newPost.reference_post_id}
                    onChange={(event) =>
                      setNewPost({ ...newPost, reference_post_id: event.target.value })
                    }
                    placeholder="Optional ID to thread posts"
                  />
                </label>
                <button type="submit" disabled={isPosting}>
                  {isPosting ? 'Sharing...' : 'Share to feed'}
                </button>
              </form>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={showExtras}
                  onChange={(event) => setShowExtras(event.target.checked)}
                />
                Show full content & media on the feed
              </label>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
