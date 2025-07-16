import React from "react";
import "./AdminDashboard.css"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">NewsPortal</h2>
      <ul>
        <li className="active">Dashboard</li>
        <li>Articles</li>
      </ul>
      <div className="profile">
        <img src="https://i.pravatar.cc/50" alt="profile" />
        <div>
          <p>Sarah Johnson</p>
          <span>Administrator</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
