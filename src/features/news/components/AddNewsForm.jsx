import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import './AddNewsForm.css';

const AddNewsForm = () => {
  const { user } = useAuth();
  const { addNews } = useNews();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '/images/placeholders/news-default.jpg',
    link: ''
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    link: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState({ url: '', text: '' });
  const [linkErrors, setLinkErrors] = useState({ url: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openLinkModal = () => {
    if (formData.link) {
      const match = /\[(.+?)\]\((.+?)\)/.exec(formData.link);
      if (match) {
        setLinkInput({ text: match[1], url: match[2] });
      } else {
        setLinkInput({ url: '', text: '' });
      }
    } else {
      setLinkInput({ url: '', text: '' });
    }
    setLinkErrors({ url: '', text: '' });
    setShowLinkModal(true);
  };

  const closeLinkModal = () => setShowLinkModal(false);

  const handleLinkInputChange = (e) => {
    const { name, value } = e.target;
    setLinkInput((prev) => ({ ...prev, [name]: value }));
    if (linkErrors[name]) {
      setLinkErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateLinkInput = () => {
    let valid = true;
    const errors = {};
    if (!linkInput.url) {
      errors.url = 'URL is required';
      valid = false;
    } else if (!/^https?:\/\/.+/.test(linkInput.url)) {
      errors.url = 'URL must start with http:// or https://';
      valid = false;
    }
    if (!linkInput.text) {
      errors.text = 'Link text is required';
      valid = false;
    }
    setLinkErrors(errors);
    return valid;
  };

  const submitLink = () => {
    if (!validateLinkInput()) return;
    const markdownLink = `[${linkInput.text}](${linkInput.url})`;
    setFormData((prev) => ({ ...prev, link: markdownLink }));
    setShowLinkModal(false);
  };

  const validateForm = () => {
    let valid = true;
    const errors = {};
    if (!formData.title) {
      errors.title = 'Title is required';
      valid = false;
    }
    if (!formData.content) {
      errors.content = 'Content is required';
      valid = false;
    }
    if (formData.link && !/^\[.*\]\(https?:\/\/.+\)$/.test(formData.link)) {
      errors.link = 'Link format is invalid';
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user || !user.uid || !user.name) {
      setError('User not loaded. Please login again.');
      return;
    }

    // ✅ Ganti email berikut dengan email admin kamu
    if (user.email === 'admin@example.com') {
      setError('Admin is not allowed to post articles.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addNews({
        title: formData.title,
        content: formData.content,
        link: formData.link,
        image: formData.image,
        author: {
          id: user.uid,
          name: user.name,
          profilePicture: user.profilePicture || ''
        }
      });
      navigate('/my-works');
    } catch (err) {
      setError(err.message || 'Failed to add news');
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdownLink = (markdown) => {
    const match = /\[(.+?)\]\((.+?)\)/.exec(markdown);
    if (match) {
      return { text: match[1], url: match[2] };
    }
    return null;
  };

  // ✅ Tampilkan pesan khusus jika user adalah admin
  if (!user) return <div className="loading-indicator">Loading user...</div>;

  if (user.email === 'admin@example.com') {
    return (
      <div className="unauthorized-message">
        <h2>Access Denied</h2>
        <p>Admin is not allowed to publish articles.</p>
      </div>
    );
  }

  return (
    <div className="add-news-container">
      <div className="add-news-header">
        <h2>Create New Article</h2>
        <p>Share your latest news with the community</p>
      </div>

      <form className="add-news-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            <span className="error-icon" role="img" aria-label="Warning">⚠</span>
            {error}
          </div>
        )}

        <Input
          label="Title"
          type="text"
          id="title"
          name="title"
          value={formData.title}
          placeholder="Enter an engaging title"
          required
          error={formErrors.title}
          onChange={handleChange}
        />

        <div className="form-group">
          <label htmlFor="content" className="input-label">
            Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            placeholder="Enter news content"
            required
            className={`textarea-field ${formErrors.content ? 'textarea-error' : ''}`}
            onChange={handleChange}
            rows={6}
          />
          {formErrors.content && <p className="error-message">{formErrors.content}</p>}
        </div>

        <div className="form-group">
          <label className="input-label">Link (Optional)</label>
          <div className="link-input-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {formData.link ? (
              (() => {
                const parsed = parseMarkdownLink(formData.link);
                if (parsed) {
                  return (
                    <a
                      href={parsed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`input-field link-preview ${formErrors.link ? 'input-error' : ''}`}
                      style={{ flexGrow: 1, textDecoration: 'underline', color: '#4B0082' }}
                    >
                      {parsed.text}
                    </a>
                  );
                }
                return (
                  <input
                    type="text"
                    readOnly
                    value={formData.link}
                    placeholder="Invalid link format"
                    className={`input-field input-error`}
                    style={{ flexGrow: 1 }}
                  />
                );
              })()
            ) : (
              <input
                type="text"
                readOnly
                value=""
                placeholder="No link added"
                className={`input-field ${formErrors.link ? 'input-error' : ''}`}
                style={{ flexGrow: 1 }}
              />
            )}
            <button type="button" className="btn-open-link-modal" onClick={openLinkModal}>
              Add Link
            </button>
          </div>
          {formErrors.link && <p className="error-message">{formErrors.link}</p>}
        </div>

        <div className="form-group image-upload-container">
          <label htmlFor="image" className="input-label">Cover Image</label>
          <div className="image-upload-section">
            <div className="image-preview">
              {formData.image && formData.image !== '/images/placeholders/news-default.jpg' ? (
                <img src={formData.image} alt="Cover Preview" />
              ) : (
                <div className="upload-placeholder" aria-label="Upload Image Placeholder" role="img">
                  {/* SVG here */}
                  <p style={{ color: '#888', marginTop: 8 }}>Upload Image</p>
                </div>
              )}
            </div>
            <div className="upload-controls">
              <p className="upload-hint">Select an eye-catching image for your article</p>
              <label htmlFor="image" className="custom-file-input">
                Choose Image
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Publishing...' : 'Publish Article'}
          </Button>
        </div>
      </form>

      {showLinkModal && (
        <div className="link-modal-overlay">
          {/* Modal content */}
        </div>
      )}
    </div>
  );
};

export default AddNewsForm;
