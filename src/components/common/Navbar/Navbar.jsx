import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import SearchBar from '../SearchBar/SearchBar';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import './Navbar.css';

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button
            className="hamburger-btn"
            onClick={toggleMenu}
            aria-label={showMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={showMenu}
            aria-controls="main-menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            NewsPortal
          </Link>
        </div>

        <div className="navbar-center">
          <SearchBar />
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/add-news" className="btn-add" title="Add News" onClick={closeMenu}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </Link>

              <div className="user-dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  <img
                    src={user.profilePicture || defaultAvatar}
                    alt={user.name}
                    className="user-avatar"
                    width="32"
                    height="32"
                    loading="lazy"
                  />
                  <span className="user-name">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu" role="menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-works"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Works
                    </Link>
                    <Link
                      to="/bookmarks"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
                    >
                      Bookmarks
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout" role="menuitem">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn-register" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {showMenu && (
        <nav
          id="main-menu"
          className="hamburger-menu"
          role="navigation"
          aria-label="Main menu"
        >
          <ul className="menu-list">
            <li>
              <Link
                to="/"
                onClick={closeMenu}
                className="menu-item"
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9.75V21h7v-6h4v6h7V9.75L12 3z" />
                </svg>
                <span>Home</span>
              </Link>
            </li>

            {user && (
              <>
                <li>
                  <Link
                    to="/my-works"
                    onClick={closeMenu}
                    className="menu-item"
                    aria-current={location.pathname === '/my-works' ? 'page' : undefined}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 16H5v-2h2zm0-4H5v-2h2zm6 4H9v-2h4zm0-4H9v-2h4zm6 4h-2v-2h2zm0-4h-2v-2h2z" />
                    </svg>
                    <span>My Works</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/bookmarks"
                    onClick={closeMenu}
                    className="menu-item"
                    aria-current={location.pathname === '/bookmarks' ? 'page' : undefined}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4a2 2 0 0 0-2 2v16l8-5 8 5V6a2 2 0 0 0-2-2H6z" />
                    </svg>
                    <span>Bookmark</span>
                  </Link>
                </li>
              </>
            )}

            {!user && (
              <>
                <li>
                  <Link to="/login" onClick={closeMenu} className="menu-item">
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" onClick={closeMenu} className="menu-item">
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Logout button di bawah */}
          {user && (
            <div className="logout-container">
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="logout-btn"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 17l5-5-5-5M21 12H9M13 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>
      )}
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
