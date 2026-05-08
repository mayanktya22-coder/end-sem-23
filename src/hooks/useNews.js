import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Technology'); // ok.surf categories: Business, Technology, Science, etc.
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const fetchNews = useCallback(async (cat = category, force = false) => {
    setLoading(true);
    
    // Check cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp, cat: cachedCat } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION && cachedCat === cat) {
          setNews(data);
          setLoading(false);
          return;
        }
      }
    }

    try {
      // Using ok.surf API which is free and works in production (unlike NewsAPI.org free tier)
      const response = await axios.get('https://ok.surf/api/v1/cors/news-feed');
      
      // ok.surf returns an object with categories as keys. We pick the requested one.
      const categoryData = response.data[cat] || response.data['Technology'];
      
      // Map to a common format
      const formattedNews = categoryData.map(article => ({
        title: article.title,
        url: article.link,
        urlToImage: article.og || article.image,
        publishedAt: new Date().toISOString(), // ok.surf doesn't always provide date, we use current
        source: { name: article.source || 'Global News' },
        description: article.title // description is often the same as title in this API
      }));

      setNews(formattedNews);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: formattedNews,
        timestamp: Date.now(),
        cat: cat
      }));
      
      setError(null);
    } catch (err) {
      console.error('News API Error:', err);
      setError('Failed to load news. This often happens if the API is rate-limited.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews(category);
  }, [category, fetchNews]);

  const filteredNews = news
    .filter(article => 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return {
    news: filteredNews,
    allNews: news,
    loading,
    error,
    category,
    setCategory,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    refresh: () => fetchNews(category, true),
  };
};
