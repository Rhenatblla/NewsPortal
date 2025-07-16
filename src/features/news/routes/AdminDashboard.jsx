// src/features/news/routes/AdminDashboard.jsx
import React, { useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth"; // ✅ perbaikan path
import { useNews } from "../hooks/useNews";
import NewsListItem from "../components/NewsListItem";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { news, loading, error, loadNews } = useNews();

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const renderNewsList = useCallback(() => {
    return news.map((item) => <NewsListItem key={item.id} news={item} />);
  }, [news]);

  return (
    <div className="admin-dashboard">
      <div className="admin-news-section">
        {loading && <p>Loading news...</p>}
        {error && <p>Error loading news: {error}</p>}
        {!loading && !error && renderNewsList()}
      </div>
    </div>
  );
};

export default AdminDashboard;
