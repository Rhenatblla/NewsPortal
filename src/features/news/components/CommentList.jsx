import React from 'react';
import './CommentList.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';

const CommentList = ({ comments }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="comments-empty">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map(comment => (
        <div key={comment.id} className="comment-item">
          <div className="comment-header">
            <div className="comment-author">
              <img
                src={(comment.author && comment.author.profilePicture) || defaultAvatar}
                alt={(comment.author && comment.author.name) || 'Unknown'}
                className="author-avatar"
              />
              <span className="author-name">{(comment.author && comment.author.name) || 'Unknown'}</span>
            </div>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>

          <div className="comment-content">
            <p>{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
