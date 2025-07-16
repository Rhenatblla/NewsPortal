import React, { useEffect, useMemo, useState } from 'react';
import { useSearch } from '../../../context/SearchContext';
import { useNews } from '../hooks/useNews';
import NewsListItem from '../components/NewsListItem';

const SearchResults = () => {
  const { searchQuery } = useSearch(); // Ambil query dari context
  const { news, loadNews } = useNews(); // Gunakan hook news
  const [allNews, setAllNews] = useState([]);

  useEffect(() => {
    // Load semua news saat komponen mount
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    // Update allNews ketika news berubah
    if (news && Array.isArray(news)) {
      setAllNews(news);
    }
  }, [news]);

  // Filter berdasarkan query dari SearchContext
  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allNews;

    return allNews.filter((newsItem) => {
      const searchableText = [
        newsItem.title || '',
        newsItem.content || '',
        newsItem.description || '',
      ].join(' ').toLowerCase();
      return searchableText.includes(query);
    });
  }, [allNews, searchQuery]);

  return (
    <div className="search-results-container" style={{ padding: '2rem' }}>
      {filteredResults.length > 0 ? (
        filteredResults.map((item) => (
          <NewsListItem key={item.id} news={item} />
        ))
      ) : (
        <p>Tidak ada hasil ditemukan untuk "{searchQuery}"</p>
      )}
    </div>
  );
};

export default SearchResults;
