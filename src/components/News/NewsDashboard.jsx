import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const NewsDashboard = ({ data }) => {
  const { news, loading, error, searchTerm, setSearchTerm, sortBy, setSortBy, refresh, category, setCategory } = data;

  return (
    <div className="dashboard-card w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Breaking News</h2>
        <button onClick={refresh} className="btn-refresh">Refresh</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
        {['World', 'Business', 'Technology', 'Science', 'Health', 'Entertainment', 'Sports'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              category === cat
                ? 'bg-[#0077b6] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search title, source, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-[#0077b6] outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        
        <div className="relative min-w-[150px]">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm appearance-none focus:ring-1 focus:ring-[#0077b6] outline-none text-slate-600 dark:text-slate-400"
          >
            <option value="publishedAt">Sort by Date</option>
            <option value="source">Sort by Source</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-10 text-slate-400">Loading breaking news...</p>
        ) : error ? (
          <p className="text-center py-10 text-red-400">{error}</p>
        ) : news.length > 0 ? (
          news.map((article, i) => (
            <div key={i} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
              <div className="w-24 h-24 flex-shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                {article.urlToImage ? (
                  <img src={article.urlToImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">NEWS</div>
                )}
              </div>
              <div className="flex-grow flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#0077b6] dark:text-[#4cc9f0] uppercase tracking-wider mb-1">
                  <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{i+1}</span>
                  {article.source.name} | {new Date(article.publishedAt).toLocaleString()}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-[#0077b6] transition-colors">
                  {article.title}
                </h3>
              </div>
              <div className="flex items-center">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0077b6] transition-colors">
                  <ChevronDown className="-rotate-90" size={16} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-slate-400">No news articles found.</p>
        )}
      </div>
    </div>
  );
};

export default NewsDashboard;
