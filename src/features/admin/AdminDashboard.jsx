// src/features/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ArticleCard from "./ArticleCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // ← pastikan path ini benar!

const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "news"));
        const newsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArticles(newsData);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />

        <div className="admin-stats">
          <div className="stat-card purple">
            <h4>Total Articles</h4>
            <h2>{articles.length}</h2>
            <p>+12% from last month</p>
          </div>
          <div className="stat-card green">
            <h4>Published Today</h4>
            <h2>{articles.filter((a) => a.status === "published").length}</h2>
            <p>+5% from yesterday</p>
          </div>
          <div className="stat-card orange">
            <h4>Draft Articles</h4>
            <h2>{articles.filter((a) => a.status === "draft").length}</h2>
            <p>Pending review</p>
          </div>
          <div className="stat-card pink">
            <h4>Total Views</h4>
            <h2>
              {articles.reduce((acc, curr) => acc + (curr.views || 0), 0)} views
            </h2>
            <p>+18% this month</p>
          </div>
        </div>

        <div className="filter-bar">
          <input type="text" placeholder="Search articles..." />
          <select>
            <option>All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button className="filter-btn">Advanced Filter</button>
          <button className="export-btn">Export Data</button>
        </div>

        <div className="articles-grid">
          {articles.map((item, index) => (
            <ArticleCard key={item.id || index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
