// BookmarkList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import NewsListItem from '../../news/components/NewsListItem';
import { getBookmarks, removeBookmark } from '../services/bookmarkService';
import './BookmarkList.css';

const BookmarkList = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchBookmarks = async () => {
      setLoading(true);
      setError(null);

      try {
        const bookmarksData = await getBookmarks(user.uid);
        setBookmarks(bookmarksData);
      } catch (err) {
        setError(err.message || 'Failed to load bookmarks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (bookmarkId) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await removeBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
    } catch (err) {
      setError(err.message || 'Failed to remove bookmark');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-indicator">📦 Loading bookmarks...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>❌ Error: {error}</p>
        <button
          onClick={() => user && getBookmarks(user.uid).then(setBookmarks)}
          className="reload-btn"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="empty-bookmarks">
        <p>📭 Kamu belum punya bookmark apapun~</p>
      </div>
    );
  }

  return (
    <div className="bookmarks-list">
      {bookmarks.map(bookmark => (
        <div key={bookmark.id} className="bookmark-item">
          <NewsListItem
            news={{
              id: bookmark.newsId,
              title: bookmark.newsTitle,
              image: bookmark.newsImage,
              author: bookmark.author,
              content: bookmark.content,
              comments: bookmark.comments,
              likes: bookmark.likes,
              createdAt: bookmark.createdAt,
            }}
          />
          <button
            className="remove-bookmark-btn fun"
            onClick={() => handleRemoveBookmark(bookmark.id)}
            aria-label="Remove bookmark"
            title="Klik untuk hapus bookmark ini 😢"
          >
            <span role="img" aria-label="broken-heart">💔</span> Bye Bookmark!
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
