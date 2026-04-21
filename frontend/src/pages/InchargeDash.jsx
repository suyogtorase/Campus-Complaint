import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  CheckCircle, Clock, ChevronRight, X, FileVideo,
  MapPin, User, Tag, Building, ThumbsUp, Calendar, FileText, AlertTriangle
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
const DetailModal = ({ complaint: comp, onClose, onUpdate }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl font-bold text-white leading-tight">{comp.title}</h3>
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

        {/* Raised By */}
        <section>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
            <User size={12} /> Raised By
          </p>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-sm shrink-0">
              {comp.raisedBy?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-100">{comp.raisedBy?.name}</p>
              <p className="text-sm text-slate-400">{comp.raisedBy?.email}</p>
            </div>
          </div>
        </section>

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

        {/* Media */}
        {comp.media && comp.media.length > 0 && (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
              <FileText size={12} /> Attachments ({comp.media.length})
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
                    <img
                      src={url}
                      alt={`attachment-${i}`}
                      className="h-32 w-32 object-cover rounded-xl border border-slate-600 hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer"
                    />
                  </a>
                );
                return (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 transition-colors"
                  >
                    <FileVideo size={14} /> Attachment {i + 1}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Resolution Notes */}
        {comp.resolutionNotes && (
          <section>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
              <CheckCircle size={12} /> Resolution Notes
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 text-sm leading-relaxed">
              {comp.resolutionNotes}
            </div>
          </section>
        )}

        {/* Escalation notice */}
        {comp.status === "escalated" && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>This complaint has been <strong>escalated</strong> due to SLA breach (unresolved for more than 48 hours).</span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-6 pt-0 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Close
        </button>
        <button
          onClick={() => { onClose(); onUpdate(comp); }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
        >
          Update Status
        </button>
      </div>
    </div>
  </div>
);

// ─── Update Modal ─────────────────────────────────────────────────────────────
const UpdateModal = ({ complaint, onClose, onSuccess }) => {
  const [status, setStatus] = useState(complaint.status);
  const [notes, setNotes] = useState(complaint.resolutionNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/complaints/${complaint._id}/status`, { status, resolutionNotes: notes });
      toast.success("Complaint updated!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold">Update Status</h3>
            <p className="text-slate-400 text-sm mt-0.5 truncate max-w-[280px]">{complaint.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block font-medium mb-2 text-slate-400 text-sm">New Status</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">🟡 Pending</option>
              <option value="in_progress">🔵 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2 text-slate-400 text-sm">
              Resolution Notes {status === "resolved" && <span className="text-rose-400">*</span>}
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              rows="3"
              placeholder="Describe what was done to resolve this..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required={status === "resolved"}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : <><CheckCircle size={16} /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const InchargeDash = () => {
  const [complaints, setComplaints] = useState([]);
  const [detailComplaint, setDetailComplaint] = useState(null);
  const [updateComplaint, setUpdateComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/complaints/assigned");
      setComplaints(data);
    } catch {
      toast.error("Failed to load assigned complaints");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div>
      {/* Modals */}
      {detailComplaint && (
        <DetailModal
          complaint={detailComplaint}
          onClose={() => setDetailComplaint(null)}
          onUpdate={(comp) => setUpdateComplaint(comp)}
        />
      )}
      {updateComplaint && (
        <UpdateModal
          complaint={updateComplaint}
          onClose={() => setUpdateComplaint(null)}
          onSuccess={fetchComplaints}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Assigned Complaints</h2>
          <p className="text-slate-400 text-sm mt-1">
            {complaints.length} complaint{complaints.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      {/* Empty state */}
      {complaints.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center">
          <CheckCircle className="mx-auto mb-4 text-emerald-500" size={48} />
          <p className="text-xl font-semibold mb-2">All caught up!</p>
          <p className="text-slate-400">No complaints are currently assigned to you.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((comp) => (
            <div
              key={comp._id}
              onClick={() => setDetailComplaint(comp)}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group"
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
                    <span className="flex items-center gap-1"><User size={11} /> {comp.raisedBy?.name}</span>
                    <span className="flex items-center gap-1 capitalize"><Tag size={11} /> {comp.category}</span>
                    <span className="flex items-center gap-1"><Building size={11} /> {comp.department}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {comp.upvotes?.length ?? 0} upvotes</span>
                    {comp.media?.length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-400"><FileText size={11} /> {comp.media.length} attachment{comp.media.length > 1 ? "s" : ""}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock size={11} /> {new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right arrow + Update button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUpdateComplaint(comp); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-400 font-medium transition-all cursor-pointer"
                  >
                    Update Status
                  </button>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InchargeDash;
