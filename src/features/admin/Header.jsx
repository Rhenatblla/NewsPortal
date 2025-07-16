import React from "react";
import "./Header.css";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // ⬅️ Redirect setelah logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="admin-header">
      <div className="header-left">
        <h1>Content Management</h1>
      </div>

      <div className="header-right">
        {user && <span className="admin-name">Hello, {user.name || user.email}</span>}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
