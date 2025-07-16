import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../../context/SearchContext';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setSearchQuery } = useSearch();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return; // ⛔ Jangan navigate kalau kosong

    setSearchQuery(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Search your news here!"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
