import React from "react";
import "./AdminDashboard.css";

const ArticleCard = ({ title, status, image, author, views, date }) => (
  <div className="article-card">
    <img src={image} alt={title} className="article-image" />

    <div className="article-tags">
      <span className={`status ${status?.toLowerCase()}`}>{status}</span>
    </div>

    <h3>{title}</h3>

    <div className="article-meta">
      <div className="author-info">
        {author?.profilePicture && (
          <img
            src={author.profilePicture}
            alt={author.name}
            className="author-avatar"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              marginRight: "8px",
              objectFit: "cover",
            }}
          />
        )}
        <span>{author?.name || "Unknown Author"}</span>
      </div>
      <div className="meta-info">
        <span>{views} views</span> • <span>{date}</span>
      </div>
    </div>

    <div className="article-actions">
      <button>✏️</button>
      <button>🗑️</button>
      <button>👁️ View Details</button>
    </div>
  </div>
);

export default ArticleCard;
