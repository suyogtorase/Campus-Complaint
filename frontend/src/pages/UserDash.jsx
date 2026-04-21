import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  PlusCircle, Clock, X, ChevronRight,
  MapPin, Tag, Building, ThumbsUp, Calendar,
  FileText, FileVideo, User, CheckCircle, AlertTriangle, MessageSquare
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  if (status === "pending")     return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (status === "in_progress") return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
  if (status === "resolved")    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (status === "escalated")   return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
};

const getPriorityColor = (p) => {
  if (p === "high")   return "text-rose-400";
  if (p === "medium") return "text-amber-400";
  return "text-slate-400";
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ complaint: comp, onClose, onUpvote }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl font-bold text-white">{comp.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusColor(comp.status)}`}>
              {comp.status.replace("_", " ")}
            </span>
            <span className={`text-xs font-semibold capitalize ${getPriorityColor(comp.priority)}`}>
              ● {comp.priority} priority
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={11} /> {new Date(comp.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 mt-1">
          <X size={22} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-6">

        {/* Description */}
        <section>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
            <FileText size={12} /> Description
          </p>
          <p className="text-slate-200 leading-relaxed bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            {comp.description}
          </p>
        </section>

        {/* Meta grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Tag size={11} /> Category</p>
            <p className="font-semibold capitalize text-slate-100">{comp.category || "—"}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Building size={11} /> Department</p>
            <p className="font-semibold text-slate-100">{comp.department || "General"}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ThumbsUp size={11} /> Upvotes</p>
            <p className="font-semibold text-slate-100">{comp.upvotes?.length ?? 0}</p>
          </div>
        </section>

        {/* Assigned incharge */}
        {comp.assignedTo && (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
              <User size={12} /> Assigned Incharge
            </p>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-sm shrink-0">
                {comp.assignedTo?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-100">{comp.assignedTo?.name}</p>
                <p className="text-sm text-slate-400 capitalize">{comp.assignedTo?.department} Department</p>
              </div>
            </div>
          </section>
        )}

        {/* Location */}
        {(comp.location?.building || comp.location?.floor || comp.location?.room) && (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Location
            </p>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
              {comp.location.building && <span className="text-slate-300">🏢 <strong>Building:</strong> {comp.location.building}</span>}
              {comp.location.floor    && <span className="text-slate-300">🔢 <strong>Floor:</strong> {comp.location.floor}</span>}
              {comp.location.room     && <span className="text-slate-300">🚪 <strong>Room:</strong> {comp.location.room}</span>}
            </div>
          </section>
        )}

        {/* Media uploaded by student */}
        {comp.media && comp.media.length > 0 && (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
              <FileText size={12} /> Your Attachments ({comp.media.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {comp.media.map((url, i) => {
                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
                if (isVideo) return (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-600 bg-slate-900 w-full">
                    <video src={url} controls className="w-full max-h-64 object-contain" />
                  </div>
                );
                if (isImage) return (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`attachment-${i}`}
                      className="h-32 w-32 object-cover rounded-xl border border-slate-600 hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer" />
                  </a>
                );
                return (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 transition-colors">
                    <FileVideo size={14} /> Attachment {i + 1}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Incharge Resolution Message ── */}
        {comp.resolutionNotes ? (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
              <MessageSquare size={12} /> Message from Incharge
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 leading-relaxed">{comp.resolutionNotes}</p>
                  {comp.assignedTo?.name && (
                    <p className="text-emerald-500/70 text-xs mt-2">— {comp.assignedTo.name}, {comp.assignedTo?.department} Incharge</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : comp.status !== "resolved" && (
          <section>
            <div className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 text-slate-400 text-sm">
              <MessageSquare size={16} className="shrink-0" />
              <span>No message from the incharge yet. You'll see their response here once the complaint is resolved.</span>
            </div>
          </section>
        )}

        {/* Escalation notice */}
        {comp.status === "escalated" && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>Your complaint has been <strong>escalated</strong> because it wasn't resolved within 48 hours. It has been flagged for admin attention.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-0 flex justify-between items-center gap-3">
        <button
          onClick={() => { onUpvote(comp._id); onClose(); }}
          disabled={comp.status === "resolved"}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
        >
          <PlusCircle size={15} /> Upvote ({comp.upvotes?.length ?? 0})
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const UserDash = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/complaints/my");
      setComplaints(data);
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.put(`/complaints/${id}/upvote`);
      toast.success("Upvoted!");
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error upvoting");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div>
      {/* Detail Modal */}
      {selectedComplaint && (
        <DetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={handleUpvote}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">My Complaints</h2>
          <p className="text-slate-400 text-sm mt-1">{complaints.length} complaint{complaints.length !== 1 ? "s" : ""} raised</p>
        </div>
      </div>

      {/* Empty state */}
      {complaints.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center">
          <FileText className="mx-auto mb-4 text-slate-500" size={48} />
          <p className="text-xl font-semibold mb-2">No complaints yet</p>
          <p className="text-slate-400">You haven't raised any complaints. Use "Raise Complaint" to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((comp) => (
            <div
              key={comp._id}
              onClick={() => setSelectedComplaint(comp)}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-base group-hover:text-indigo-300 transition-colors">{comp.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusColor(comp.status)}`}>
                      {comp.status.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-semibold capitalize ${getPriorityColor(comp.priority)}`}>
                      ● {comp.priority}
                    </span>
                  </div>

                  {/* Description preview */}
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">{comp.description}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 capitalize"><Tag size={11} /> {comp.category}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {comp.upvotes?.length ?? 0} upvotes</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {new Date(comp.createdAt).toLocaleDateString()}</span>
                    {/* Show green indicator if incharge left a message */}
                    {comp.resolutionNotes && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <MessageSquare size={11} /> Incharge replied
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Upvote shortcut */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUpvote(comp._id); }}
                    disabled={comp.status === "resolved"}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusCircle size={13} className="inline mr-1" />Upvote
                  </button>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDash;
