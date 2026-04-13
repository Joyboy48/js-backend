import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, UserPlus, FileVideo } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { VideoCard } from "../components/VideoCard";

const ChannelProfile = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Strict DB reliance

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const channelRes = await api.get(`/users/c/${username}`);
        const channelData = channelRes.data?.data;
        
        if (channelData) {
           setChannel(channelData);
           
           // Now fetch videos using the actual ObjectId of the channel
           const videosRes = await api.get(`/videos?userId=${channelData._id}`);
           
           if(videosRes.data?.data) {
              let fetchedVideos = videosRes.data.data;
              let vidsArray = fetchedVideos.videos || fetchedVideos.docs || fetchedVideos;
              setVideos(Array.isArray(vidsArray) ? vidsArray : []);
           } else {
              setVideos([]);
           }
        } else {
           setChannel(null);
           setVideos([]);
        }
      } catch (error) {
        setChannel(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  const toggleSubscribe = async () => {
    try {
      await api.post(`/subscriptions/c/${channel?._id}`);
      setChannel(prev => ({
          ...prev, 
          isSubscribed: !prev.isSubscribed, 
          subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
      }));
      toast.success(channel.isSubscribed ? "Unsubscribed" : "Subscribed!");
    } catch {
      toast.error("Failed to subscribe");
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div></div>;

  return (
    <div className="w-full flex justify-center pb-20">
      <div className="w-full max-w-7xl">
        
        {/* Banner/Cover Image */}
        <div className="w-full h-48 md:h-64 lg:h-80 relative overflow-hidden rounded-b-3xl">
           <img 
             src={channel?.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format"} 
             alt="Cover" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 md:px-12 relative -mt-16 flex flex-col md:flex-row gap-6 items-start md:items-end">
           
           {/* Avatar */}
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-background shadow-2xl relative z-10"
           >
              <img src={channel?.avatar} alt="Avatar" className="w-full h-full object-cover" />
           </motion.div>
           
           {/* Details */}
           <div className="flex-1 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                 {channel?.fullName}
                 <CheckCircle2 size={24} className="text-primary" />
              </h1>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-gray-400 font-medium text-sm">
                 <span className="text-white">@{channel?.username}</span>
                 <span>{channel?.subscribersCount?.toLocaleString() || 0} subscribers</span>
                 <span>{videos.length} videos</span>
              </div>
              
              <p className="mt-4 text-sm text-gray-300 max-w-2xl leading-relaxed">
                 Welcome to my elite channel. I build the most stunning technical projects on the internet.
              </p>
           </div>
           
           {/* Action Buttons */}
           <div className="pb-4 w-full md:w-auto">
              <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleSubscribe}
                 className={`w-full md:w-auto px-8 py-3 rounded-full font-bold transition-all shadow-xl flex justify-center items-center gap-2 ${
                   channel?.isSubscribed 
                     ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" 
                     : "bg-gradient-to-r from-primary to-accent text-white"
                 }`}
               >
                 {!channel?.isSubscribed && <UserPlus size={18} />}
                 {channel?.isSubscribed ? "Subscribed" : "Subscribe"}
               </motion.button>
           </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/10 my-8"></div>

        {/* Videos Grid */}
        <div className="px-4 md:px-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <FileVideo size={20} className="text-primary"/>
               Videos
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
               {videos.map(video => (
                  <VideoCard key={video._id} video={video} />
               ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ChannelProfile;
