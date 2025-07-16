// src/features/news/components/NewsDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import {
  FaRegHeart,
  FaHeart,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaEdit,
  FaTrash,
  FaComment
} from 'react-icons/fa';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import './NewsDetail.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import { toggleLike } from '../services/newsService';

const NewsDetail = ({ news }) => {
  const { user } = useAuth();
  const { deleteNews, updateComment, deleteComment, updateNewsInContext } = useNews();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(news.likesCount || 0);

  const isOwnerOrAdmin =
    user && (news.author?.id === user.id || user.uid === news.author?.id || user.role === 'admin');

  useEffect(() => {
    if (user && news.likedBy) {
      setIsLiked(news.likedBy.includes(user.uid || user.id));
    } else {
      setIsLiked(false);
    }
    setLikeCount(news.likesCount || 0);
  }, [news.likedBy, news.likesCount, user]);

  const handleLikeClick = async () => {
    if (!user) {
      alert('Login terlebih dahulu untuk menyukai berita ini.');
      return;
    }

    try {
      const updatedNews = await toggleLike(news.id, user.uid || user.id);
      const hasLiked = updatedNews.likedBy.includes(user.uid || user.id);

      setIsLiked(hasLiked);
      setLikeCount(updatedNews.likesCount);

      updateNewsInContext(updatedNews);
    } catch (error) {
      console.error('Gagal memperbarui suka:', error);
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date)) return 'Invalid date';
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const parseMarkdownLink = (markdown) => {
    const match = /\[(.+?)\]\((.+?)\)/.exec(markdown);
    return match ? { text: match[1], url: match[2] } : null;
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await deleteNews(news.id);
        navigate('/my-works');
      } catch (err) {
        alert('Gagal menghapus berita: ' + (err.message || 'Error tidak diketahui'));
        console.error(err);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
      try {
        await deleteComment(news.id, commentId);
      } catch (err) {
        alert('Gagal menghapus komentar: ' + (err.message || 'Error tidak diketahui'));
      }
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateComment(news.id, commentId, newContent);
    } catch (err) {
      alert('Gagal memperbarui komentar: ' + (err.message || 'Error tidak diketahui'));
    }
  };

  const handleCommentAddedToNews = () => {
    console.log('Komentar baru berhasil ditambahkan.');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${location.pathname}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link berhasil disalin!');
    });
  };

  return (
    <>
      <div className="news-detail">
        <div className="news-header">
          <h1 className="news-title">{news.title}</h1>

          <div className="news-meta">
            <div className="news-author">
              <img
                src={news.author?.profilePicture || defaultAvatar}
                alt={news.author?.name || 'User'}
                className="author-avatar"
              />
              <span className="author-name">{news.author?.name || 'User'}</span>
            </div>
            <span className="news-date">
              Diupload: {formatDate(news.createdAt)}
              {news.updatedAt && ` | Diperbarui: ${formatDate(news.updatedAt)}`}
            </span>
          </div>
        </div>

        <div className="news-image">
          <img src={news.image} alt={news.title} />
        </div>

        <div className="news-content">
          <p>{news.content}</p>

          {news.link &&
            (() => {
              const link = parseMarkdownLink(news.link);
              return link ? (
                <p className="news-link">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                </p>
              ) : null;
            })()}
        </div>

        {/* NEWS ACTIONS */}
        <div className="news-actions">
          <div className="news-stats">
            <span className="news-comments" role="button" tabIndex={0} title="Lihat Komentar">
              <FaComment className="icon" /> Komentar
            </span>

            <span
              className={`news-likes ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              role="button"
              tabIndex={0}
              title={isLiked ? 'Batalkan Suka' : 'Suka'}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLikeClick()}
            >
              {isLiked ? (
                <FaHeart className="icon" style={{ color: '#e63946' }} />
              ) : (
                <FaRegHeart className="icon" />
              )}
              {likeCount} Suka
            </span>
          </div>

          {isOwnerOrAdmin && (
            <div className="news-author-actions">
              <Link to={`/edit-news/${news.id}`} className="btn-edit" title="Edit Berita">
                <FaEdit style={{ marginRight: '6px' }} />
                Edit
              </Link>
              <button className="btn-delete" onClick={handleDelete} title="Hapus Berita">
                <FaTrash style={{ marginRight: '6px' }} />
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* Komentar */}
        <div className="news-comments-section">
          <h3 className="comments-title">Komentar</h3>

          {user ? (
            <CommentForm newsId={news.id} onCommentAdded={handleCommentAddedToNews} />
          ) : (
            <div className="comments-login-prompt">
              <p>
                <Link to="/login">Login</Link> atau{' '}
                <Link to="/register">daftar</Link> untuk memberikan komentar.
              </p>
            </div>
          )}

          <CommentList
            newsId={news.id}
            currentUserId={user?.uid || user?.id}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
          />
        </div>
      </div>

      {/* Share Section */}
      <div className="news-share-section">
        <h3>Bagikan Berita Ini:</h3>
        <div className="share-buttons">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button facebook"
            title="Bagikan ke Facebook"
          >
            <FaFacebook />
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button twitter"
            title="Bagikan ke Twitter"
          >
            <FaTwitter />
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(news.title + ' ' + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button whatsapp"
            title="Bagikan ke WhatsApp"
          >
            <FaWhatsapp />
          </a>

          <button onClick={handleCopyLink} className="share-button copy-link" title="Salin Link">
            <FaLink />
          </button>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
