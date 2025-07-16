// src/features/news/routes/Dashboard.jsx
import React, { useEffect, useCallback } from "react";
import { useNews } from "../hooks/useNews";
import { useAuth } from "../../auth/hooks/useAuth";
import NewsListItem from "../components/NewsListItem";
import "./Dashboard.css";

const Dashboard = () => {
  const { news, loading, error, loadNews } = useNews();
  const { user, loading: userLoading } = useAuth();

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const renderNewsList = useCallback(() => {
    return news.map((item) => <NewsListItem key={item.id} news={item} />);
  }, [news]);

  if (loading || userLoading) return <div className="loading-indicator">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {error && (
          <div className="error-message">
            <p>Failed to load news: {error}</p>
            <button onClick={loadNews} className="reload-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="empty-state">
            <p>No news available at the moment.</p>
          </div>
        )}

        {user?.role === "admin" && (
          <div className="admin-actions">
            <button className="btn-primary"></button>
          </div>
        )}

        <div className="news-list">{!loading && renderNewsList()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
