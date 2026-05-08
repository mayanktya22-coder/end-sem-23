import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');

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
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: cat,
          language: 'en',
          pageSize: 20,
          apiKey: apiKey,
        },
      });

      const articles = response.data.articles || [];
      setNews(articles);
      
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: articles,
        timestamp: Date.now(),
        cat: cat
      }));
      
      setError(null);
    } catch (err) {
      console.error('News API Error:', err);
      setError('Failed to load news articles. Please check your API key.');
      // Fallback to empty or mock if needed, but here we just show error
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews(category);
  }, [category, fetchNews]);

  const filteredNews = news
    .filter(article => 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'publishedAt') {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
      return (a.source?.name || '').localeCompare(b.source?.name || '');
    });

  return {
    news: filteredNews,
    allNews: news, // Raw data for charts
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
