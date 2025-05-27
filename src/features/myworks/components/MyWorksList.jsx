// src/features/myworks/components/MyWorksList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import NewsListItem from '../../news/components/NewsListItem';
import { getUserNews, deleteUserNews, updateUserNews } from '../services/MyWorksService'; // updateUserNews diimport
import Button from '../../../components/common/Button/Button';
import './MyWorksList.css';

const MyWorksList = () => {
  const { user } = useAuth();
  const [userNews, setUserNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserNews = useCallback(async () => {
    if (!user || !user.uid) {
      setUserNews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const news = await getUserNews(user.uid);
      setUserNews(news);
    } catch (err) {
      setError(err.message || 'Failed to load your news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserNews();
  }, [fetchUserNews]);

  const handleUpdate = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateUserNews(id, data);  // Panggil updateUserNews
      setUserNews(prev =>
        prev.map(item => (item.id === id ? updated : item))
      );
    } catch (err) {
      setError(err.message || 'Failed to update news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUserNews(id);
      setUserNews(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-indicator">Loading your news...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={fetchUserNews} className="reload-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (userNews.length === 0) {
    return (
      <div className="empty-works">
        <p>You haven't created any news yet.</p>
        <Link to="/add-news" className="btn-add-news">
          <Button variant="primary">Create Your First News</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-works-list">
      <div className="my-works-header">
        <h2>Your Published News</h2>
        <Link to="/add-news" className="btn-add-news">
          <Button variant="primary" size="small">Add News</Button>
        </Link>
      </div>

      <div className="works-list">
        {userNews.map(news => (
          <div key={news.id} className="work-item">
            <div className="work-meta">
              <span className="work-date">Last Updated on {formatDate(news.updatedAt)}</span>
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleUpdate(news.id, { title: news.title + ' (Updated)' })}
                style={{ marginLeft: 8 }}
              >
                Update Title
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleDelete(news.id)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </Button>
            </div>

            <NewsListItem news={news} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyWorksList;
