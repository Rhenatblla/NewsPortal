import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import Button from '../../../components/common/Button/Button';
import './CommentForm.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';

const CommentForm = ({ newsId }) => {
  const { user } = useAuth();
  const { addComment } = useNews();

  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addComment(newsId, {
        content: comment,
        author: {
          id: user.uid, // pakai uid
          name: user.name,
          profilePicture: user.profilePicture || defaultAvatar,
        },
      });

      setComment('');
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="comment-form-container">
      {error && <div className="form-error">{error}</div>}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-group">
          <img
            src={user?.profilePicture || defaultAvatar}
            alt={user?.name || 'User'}
            className="comment-avatar"
          />

          <input
            type="text"
            placeholder="What are your thoughts?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={isLoading || !comment.trim()}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </div>
  );
};

export default CommentForm;
