import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  X, Search, Filter, Calendar, Tag, Building,
  ThumbsUp, FileText, FileVideo, MapPin, User, Shield,
  MessageSquare, CheckCircle, AlertTriangle, ChevronDown, Clock
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusColor = (s) => {
  if (s === "pending")     return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s === "in_progress") return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
  if (s === "resolved")    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (s === "escalated")   return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
};

const getPriorityColor = (p) => {
  if (p === "high")   return "text-rose-400";
  if (p === "medium") return "text-amber-400";
  return "text-slate-400";
};

const Avatar = ({ name, color = "indigo" }) => (
  <div className={`w-9 h-9 rounded-full bg-${color}-600/30 border border-${color}-500/30 flex items-center justify-center text-${color}-400 font-semibold text-sm shrink-0`}>
    {name?.charAt(0).toUpperCase() || "?"}
  </div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ complaint: comp, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(comp.status);
  const [notes, setNotes] = useState(comp.resolutionNotes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (status === "resolved" && !notes.trim()) {
      toast.error("Resolution notes are required when marking as resolved");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/complaints/${comp._id}/status`, { status, resolutionNotes: notes });
      toast.success("Complaint updated!");
      onStatusUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
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
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Tag size={10} /> Category</p>
              <p className="font-semibold capitalize text-slate-100 text-sm">{comp.category || "—"}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Building size={10} /> Department</p>
              <p className="font-semibold text-slate-100 text-sm">{comp.department || "General"}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ThumbsUp size={10} /> Upvotes</p>
              <p className="font-semibold text-slate-100 text-sm">{comp.upvotes?.length ?? 0}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FileText size={10} /> Media</p>
              <p className="font-semibold text-slate-100 text-sm">{comp.media?.length > 0 ? `${comp.media.length} file(s)` : "None"}</p>
            </div>
          </section>

          {/* Two-column people info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raised By */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                <User size={12} /> Raised By (Complainant)
              </p>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 h-full">
                <Avatar name={comp.raisedBy?.name} color="purple" />
                <div>
                  <p className="font-semibold text-slate-100">{comp.raisedBy?.name || "Unknown"}</p>
                  <p className="text-sm text-slate-400">{comp.raisedBy?.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{comp.raisedBy?.department !== "NONE" ? comp.raisedBy?.department : "General"} • {comp.raisedBy?.role}</p>
                </div>
              </div>
            </div>

            {/* Assigned Incharge */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                <Shield size={12} /> Assigned Incharge
              </p>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 h-full">
                {comp.assignedTo ? (
                  <>
                    <Avatar name={comp.assignedTo?.name} color="indigo" />
                    <div>
                      <p className="font-semibold text-slate-100">{comp.assignedTo?.name}</p>
                      <p className="text-sm text-slate-400">{comp.assignedTo?.email || "—"}</p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{comp.assignedTo?.department} Incharge</p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">Not yet assigned</p>
                )}
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

          {/* Resolution notes */}
          {comp.resolutionNotes && (
            <section>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                <MessageSquare size={12} /> Resolution Message from Incharge
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 leading-relaxed">{comp.resolutionNotes}</p>
                  {comp.assignedTo?.name && (
                    <p className="text-emerald-500/60 text-xs mt-1.5">— {comp.assignedTo.name}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Escalation notice */}
          {comp.status === "escalated" && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>This complaint was <strong>auto-escalated</strong> by the SLA system due to no resolution within 48 hours.</span>
            </div>
          )}

          {/* Admin Status Override */}
          <section className="border-t border-slate-700 pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
              <Shield size={12} /> Admin Override — Update Status
            </p>
            <div className="flex flex-col gap-3">
              <select
                className="w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">🟡 Pending</option>
                <option value="in_progress">🔵 In Progress</option>
                <option value="resolved">🟢 Resolved</option>
                <option value="escalated">🔴 Escalated</option>
              </select>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                rows="2"
                placeholder="Add resolution/admin notes (required if marking resolved)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><CheckCircle size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── All Complaints Page ──────────────────────────────────────────────────────
const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    let list = complaints;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.raisedBy?.name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    if (deptFilter !== "all")   list = list.filter(c => c.department === deptFilter);
    setFiltered(list);
  }, [search, statusFilter, deptFilter, complaints]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/complaints");
      setComplaints(data);
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "bg-slate-900 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div>
      {selected && (
        <DetailModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={fetchAll}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">All Complaints</h2>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} of {complaints.length} complaints</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, person, category..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-50 pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
        <select className={selectClass} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="all">All Departments</option>
          <option value="NONE">General</option>
          <option value="COMP">COMP</option>
          <option value="IT">IT</option>
          <option value="AI&DS">AI&DS</option>
          <option value="ENTC">ENTC</option>
          <option value="ECE">ECE</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center">
          <Filter size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-xl font-semibold mb-1">No results</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40">
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Complaint</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Raised By</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Assigned To</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Priority</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comp) => (
                  <tr
                    key={comp._id}
                    onClick={() => setSelected(comp)}
                    className="border-b border-slate-700/50 hover:bg-indigo-500/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-100 group-hover:text-indigo-300 transition-colors mb-0.5">{comp.title}</p>
                      <span className="text-xs text-slate-500 capitalize">{comp.category} • {comp.department}</span>
                      {comp.media?.length > 0 && <span className="ml-2 text-xs text-indigo-400">{comp.media.length} file(s)</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={comp.raisedBy?.name} color="purple" />
                        <div>
                          <p className="font-medium text-slate-200">{comp.raisedBy?.name || "—"}</p>
                          <p className="text-xs text-slate-500">{comp.raisedBy?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {comp.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={comp.assignedTo?.name} color="indigo" />
                          <div>
                            <p className="font-medium text-slate-200">{comp.assignedTo?.name}</p>
                            <p className="text-xs text-slate-500">{comp.assignedTo?.department}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(comp.status)}`}>
                        {comp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className={`px-5 py-4 font-semibold capitalize text-xs ${getPriorityColor(comp.priority)}`}>
                      {comp.priority}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1"><Clock size={11} />{new Date(comp.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
