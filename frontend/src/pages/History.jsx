import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Strict DB reliance

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/users/history");
        if (data?.data && data.data.length > 0) {
        setHistory(data.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = () => {
     // In a real scenario, you'd call a backend endpoint here to clear history
     toast.success("Watch history cleared");
     setHistory([]);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div></div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HistoryIcon size={32} className="text-primary" />
          Watch History
        </h1>
        <button 
           onClick={clearHistory}
           className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors font-medium text-sm border border-white/10"
        >
           <Trash2 size={16} />
           Clear all watch history
        </button>
      </div>

      {/* Video List */}
      <div className="flex flex-col gap-4">
        {history.length === 0 ? (
           <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
              <HistoryIcon size={48} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium text-white mb-2">No watch history</h2>
              <p>Videos you watch will show up here</p>
           </div>
        ) : (
          history.map((video) => (
            <div key={video._id} className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group relative border border-transparent hover:border-white/5">
              
              <Link to={`/video/${video._id}`} className="relative sm:w-64 shrink-0 rounded-xl overflow-hidden aspect-video">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-medium rounded-md backdrop-blur-sm">
                  {Math.floor((video.duration || 0) / 60)}:{Math.floor((video.duration || 0) % 60).toString().padStart(2, '0')}
                </div>
              </Link>
              
              <div className="flex flex-col flex-1 py-1">
                <Link to={`/video/${video._id}`} className="text-lg md:text-xl font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {video.title}
                </Link>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400 font-medium">
                   <span>{video.views} views</span>
                   <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                   <span className="flex items-center gap-1"><Clock size={14}/> Today</span>
                </div>
                
                <Link to={`/c/${video.owner?.username}`} className="flex items-center gap-3 mt-4 hover:text-white transition-colors w-max">
                  <img src={video.owner?.avatar} alt={video.owner?.fullName} className="w-8 h-8 rounded-full border border-white/10" />
                  <span className="text-sm font-medium text-gray-300">{video.owner?.fullName}</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
