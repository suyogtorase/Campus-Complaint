import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Upload, X, SendHorizontal } from "lucide-react";

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    department: "NONE",
    location: { building: "", floor: "", room: "" },
  });

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 3) {
      toast.error("Maximum 3 media files allowed");
      return;
    }
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("department", formData.department);
      payload.append("location", JSON.stringify(formData.location));

      mediaFiles.forEach((file) => {
        payload.append("media", file);
      });

      await api.post("/complaints", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Complaint raised successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-900 border border-slate-700 text-slate-50 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors";
  const labelClass = "block font-medium mb-2 text-slate-400 text-sm";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Raise a New Complaint</h2>
        <p className="text-slate-400 mt-1">Fill out the details below. Our AI will auto-categorize if you leave the category blank.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">

          {/* Title */}
          <div>
            <label className={labelClass}>Complaint Title <span className="text-rose-400">*</span></label>
            <input
              type="text"
              className={inputClass}
              required
              placeholder="e.g. Projector not working in Lab 3"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description <span className="text-rose-400">*</span></label>
            <textarea
              className={inputClass}
              rows="4"
              required
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-slate-500 text-xs mt-1.5">Tip: Leave category blank and AI will auto-suggest one based on your description.</p>
          </div>

          {/* Category + Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">🤖 Let AI Decide</option>
                <option value="lab">🔬 Laboratory</option>
                <option value="mess">🍽 Mess / Food</option>
                <option value="hostel">🏠 Hostel</option>
                <option value="infra">🏗 Infrastructure</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Related Department</label>
              <select
                className={inputClass}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="NONE">General / None</option>
                <option value="COMP">COMP — Computer Engg.</option>
                <option value="IT">IT — Info Technology</option>
                <option value="AI&DS">AI&DS — AI & Data Science</option>
                <option value="ENTC">ENTC</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location (Optional)</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                className={inputClass}
                placeholder="Building"
                value={formData.location.building}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, building: e.target.value } })}
              />
              <input
                type="text"
                className={inputClass}
                placeholder="Floor"
                value={formData.location.floor}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, floor: e.target.value } })}
              />
              <input
                type="text"
                className={inputClass}
                placeholder="Room No."
                value={formData.location.room}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, room: e.target.value } })}
              />
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className={labelClass}>Attach Media (Photos/Videos)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors group">
              <Upload className="text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" size={24} />
              <span className="text-slate-400 text-sm group-hover:text-indigo-400 transition-colors">Click to upload photos/videos</span>
              <span className="text-slate-500 text-xs mt-1">PNG, JPG, MP4 — Max 3 files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaChange}
              />
            </label>

            {/* Preview */}
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative group bg-slate-700 rounded-lg overflow-hidden flex items-center gap-2 px-3 py-2 pr-8 text-sm text-slate-300">
                    <span className="truncate max-w-[160px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Submitting..." : <><SendHorizontal size={18} /> Submit Complaint</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseComplaint;
