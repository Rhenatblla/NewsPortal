import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import Button from '../../../components/common/Button/Button';
import './CommentForm.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import EmojiPicker from 'emoji-picker-react';
import { addCommentToNews } from '../services/commentService';

const userList = [
  { id: 'user123', name: 'Rhena' },
  { id: 'user456', name: 'Tabella' },
  { id: 'user789', name: 'JohnDoe' },
];

const CommentForm = ({
  newsId,
  parentCommentId = null,
  onCommentAdded,
  onCancelReply,
  parentAuthorName = ''
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmojiClick = (emojiData) => {
    setComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setComment(value);

    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filtered = userList.filter(u => u.name.toLowerCase().includes(query));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    const newText = comment.replace(/@(\w*)$/, `@${name} `);
    setComment(newText);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const commentData = {
        content: comment.trim(),
        author: {
          id: user.uid,
          name: user.name,
          profilePicture: user.profilePicture || defaultAvatar,
        }
      };

      await addCommentToNews(newsId, commentData, parentCommentId);

      setComment('');
      if (onCommentAdded) onCommentAdded();
      if (onCancelReply) onCancelReply();
    } catch (err) {
      setError(err.message || 'Gagal menambahkan komentar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`comment-form-container ${parentCommentId ? 'reply-form-container' : ''}`}>
      {error && <div className="form-error">{error}</div>}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-group">
          <img
            src={user?.profilePicture || defaultAvatar}
            alt={user?.name || 'Pengguna'}
            className="comment-avatar"
          />

          <div className="comment-input-wrapper">
            <input
              type="text"
              placeholder={
                parentCommentId
                  ? `Replying to ${parentAuthorName || 'user'}`
                  : 'What are your thoughts? (use @mention)'
              }
              value={comment}
              onChange={handleInputChange}
              className="comment-input"
              disabled={isLoading}
            />

            {suggestions.length > 0 && (
              <ul className="mention-suggestions">
                {suggestions.map(user => (
                  <li key={user.id} onClick={() => handleSuggestionClick(user.name)}>
                    @{user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="comment-buttons">
          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={isLoading || !comment.trim()}
          >
            {isLoading ? 'Mengirim...' : (parentCommentId ? 'Reply' : 'Send')}
          </Button>

          <button
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>

          {parentCommentId && (
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onCancelReply}
              disabled={isLoading}
              className="cancel-reply-btn"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
