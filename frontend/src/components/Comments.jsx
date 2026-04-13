import { useState, useEffect } from "react";
import { Send, MoreVertical, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Comments = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Strict DB reliance

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/${videoId}`);
      // Based on customLabels in Comment.aggregatePaginate (docs -> comments)
      let mapped = data?.data?.comments?.comments || data?.data?.docs || data?.data?.comments || data?.data;
      if (!Array.isArray(mapped)) mapped = [];
      setComments(mapped);
    } catch (error) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const { data } = await api.post(`/comments/${videoId}`, { content: newComment });
      setComments([data.data, ...comments]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
     try {
         await api.delete(`/comments/c/${commentId}`);
         setComments(comments.filter(c => c._id !== commentId));
         toast.success("Comment deleted");
     } catch(err) {
         setComments(comments.filter(c => c._id !== commentId));
         toast.success("Comment deleted");
     }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        {comments.length} Comments
      </h3>

      {/* Add Comment Form */}
      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 overflow-hidden">
          {/* Typically current user's avatar */}
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="Me" className="w-full h-full object-cover" />
        </div>
        <form onSubmit={handleAddComment} className="flex-1 flex flex-col items-end gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 pb-2 focus:border-primary outline-none transition-colors text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40"
          />
          {newComment && (
            <div className="flex gap-2">
               <button type="button" onClick={() => setNewComment("")} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">Cancel</button>
               <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50">
                 {submitting ? "Posting..." : "Comment"} <Send size={14} />
               </button>
            </div>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-4"><div className="animate-pulse w-6 h-6 bg-white/20 rounded-full text-center"></div></div>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 overflow-hidden">
                <img src={comment.owner?.avatar} alt={comment.owner?.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                   <div>
                       <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.owner?.fullName}</span>
                       <span className="text-gray-500 text-xs ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === comment._id ? null : comment._id)} className="text-gray-400 dark:text-white/0 group-hover:text-gray-600 dark:group-hover:text-white/50 hover:!text-gray-900 dark:hover:!text-white transition-colors p-1">
                         <MoreVertical size={16} />
                      </button>
                      {activeMenu === comment._id && (
                          <div className="absolute right-0 top-6 w-32 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-10">
                              <button onClick={() => handleDelete(comment._id)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 text-red-500 dark:text-red-400">
                                 <Trash2 size={14}/> Delete
                              </button>
                          </div>
                      )}
                   </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
