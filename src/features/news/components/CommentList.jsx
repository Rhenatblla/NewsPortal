// src/features/news/components/CommentList.jsx
import React, { useEffect, useState } from 'react';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import CommentForm from './CommentForm';
import {
  getCommentsByNewsId,
  toggleCommentLike,
  deleteCommentById,
  updateCommentById
} from '../services/commentService';
import './CommentList.css';

const formatDateTime = (date) => {
  const dt = date?.toDate ? date.toDate() : new Date(date);
  return dt.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommentItem = ({ comment, replies, newsId, currentUserId, onRefresh }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [liking, setLiking] = useState(false);


  // const isLiked = comment.likedBy?.includes(currentUserId);
  const isAuthor = comment.author?.id === currentUserId;

  const handleToggleLike = async () => {
    setLiking(true);
    try {
      await toggleCommentLike(comment.id, currentUserId, comment.likedBy);
      onRefresh();
    } catch (err) {
      console.error('Gagal like komentar:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await updateCommentById(comment.id, editText);
      setEditing(false);
      onRefresh();
    } catch (err) {
      alert('Gagal mengedit komentar');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Hapus komentar ini?')) {
      await deleteCommentById(comment.id, newsId);
      onRefresh();
    }
  };

  return (
    <div className="comment-block">
      <div className="comment-row">
        <img src={comment.author?.profilePicture || defaultAvatar} className="comment-avatar" alt="avatar" />
        <div className="comment-content">
          <div className="comment-header">
            <strong>{comment.author?.name}</strong>
            <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
          </div>

          {editing ? (
            <>
              <textarea className="comment-edit" value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div className="comment-actions">
                <button onClick={handleSaveEdit}>Simpan</button>
                <button onClick={() => setEditing(false)}>Batal</button>
              </div>
            </>
          ) : (
            <p className="comment-text">{comment.content}</p>
          )}

          <div className="comment-footer">
            <button onClick={handleToggleLike} disabled={liking}>❤️ {comment.likesCount || 0}</button>
            <button onClick={() => setReplying(!replying)}>Reply</button>
            {isAuthor ? (
              <>
                <button onClick={() => setEditing(true)}>Edit</button>
                <button onClick={handleDelete}>Hapus</button>
              </>
            ) : null}
          </div>

          {replying && (
            <div className="reply-form">
              <CommentForm
                newsId={newsId}
                parentCommentId={comment.id}
                parentAuthorName={comment.author?.name || ''}
                onCommentAdded={() => {
                  setReplying(false);
                  onRefresh();
                }}
                onCancelReply={() => setReplying(false)}
              />
            </div>
          )}

          {/* Replies (flat structure) */}
          {replies?.length > 0 && (
            <div className="replies">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  newsId={newsId}
                  currentUserId={currentUserId}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <hr className="comment-divider" />
    </div>
  );
};

const CommentList = ({ newsId, currentUserId }) => {
  const [comments, setComments] = useState([]);

  const loadComments = async () => {
    const fetched = await getCommentsByNewsId(newsId);
    setComments(fetched);
  };

  useEffect(() => {
    loadComments();
  }, [newsId]);

  // Struktur flat: pisahkan top-level dan reply
  const topLevelComments = comments.filter(c => !c.parentId);
  const repliesMap = comments.reduce((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = [...(acc[c.parentId] || []), c];
    }
    return acc;
  }, {});

  return (
    <div className="comment-section">
      {topLevelComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesMap[comment.id] || []}
          newsId={newsId}
          currentUserId={currentUserId}
          onRefresh={loadComments}
        />
      ))}
    </div>
  );
};

export default CommentList;
