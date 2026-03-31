import { useState, useEffect } from 'react';
import { Search, TrendingUp, Globe, MapPin, Loader2, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import { getDailyMarketData, searchStock, type NewsItem, type StockRecommendation, type StockInfo } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState<{
    internationalNews: NewsItem[];
    taiwanNews: NewsItem[];
    recommendations: StockRecommendation[];
  } | null>(null);
  const [searchResult, setSearchResult] = useState<StockInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyMarketData();
      setMarketData(data);
    } catch (err) {
      console.error(err);
      setError('無法取得市場數據，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const result = await searchStock(searchQuery);
      setSearchResult(result);
    } catch (err) {
      console.error(err);
      setError('搜尋股票時發生錯誤。');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium animate-pulse">正在為您準備今日股市導航...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Header & Search */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">智股導航</h1>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋股票名稱或代碼..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-500"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
            )}
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Search Result Section */}
        <AnimatePresence>
          {searchResult && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setSearchResult(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  關閉
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">個股查詢結果</h2>
                    <div className="flex items-baseline gap-3 mt-1">
                      <h3 className="text-4xl font-bold">{searchResult.name}</h3>
                      <span className="text-xl text-gray-400 font-mono">{searchResult.symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">{searchResult.price}</span>
                  </div>
                  <div className="text-gray-300 leading-relaxed max-w-2xl prose prose-invert prose-sm">
                    <ReactMarkdown>{searchResult.analysis}</ReactMarkdown>
                  </div>
                </div>
                <div className="w-full md:w-48 aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-4">
                  <span className="text-xs font-medium text-gray-400 uppercase mb-2">買進建議分數</span>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * searchResult.score) / 100}
                        className={cn(
                          "transition-all duration-1000 ease-out",
                          searchResult.score >= 70 ? "text-green-500" : searchResult.score >= 40 ? "text-yellow-500" : "text-red-500"
                        )}
                      />
                    </svg>
                    <span className="absolute text-3xl font-bold">{searchResult.score}</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Recommendations Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold">今日精選建議</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketData?.recommendations.map((stock, idx) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-blue-500/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{stock.name}</h3>
                    <p className="text-sm text-gray-400 font-mono">{stock.symbol}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-xs">
                  <ReactMarkdown>{stock.reason}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* International News */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold">國際重要財經</h2>
            </div>
            <div className="space-y-4">
              {marketData?.internationalNews.map((news, idx) => (
                <NewsCard key={idx} news={news} />
              ))}
            </div>
          </section>

          {/* Taiwan News */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">台灣市場動態</h2>
            </div>
            <div className="space-y-4">
              {marketData?.taiwanNews.map((news, idx) => (
                <NewsCard key={idx} news={news} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 智股導航. 數據僅供參考，投資前請審慎評估風險。
          </p>
        </div>
      </footer>
    </div>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-medium text-gray-100 group-hover:text-blue-400 transition-colors leading-snug">
          {news.title}
        </h3>
        <ExternalLink className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
      </div>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
        {news.summary}
      </p>
    </a>
  );
}
