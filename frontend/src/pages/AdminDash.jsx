import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Colors matched exactly to the stat cards above:
// Pending → amber-500, In Progress → indigo-500, Resolved → emerald-500, Escalated → rose-500
const STATUS_COLORS = {
  Pending:     '#F59E0B',  // amber-500   — matches Pending card
  'In Progress': '#6366F1', // indigo-500  — matches Total/accent color
  Resolved:    '#10B981',  // emerald-500 — matches Resolved card
  Escalated:   '#F43F5E',  // rose-500    — matches Escalated card
};

const AdminDash = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (err) {
      toast.error("Failed to load analytics");
    }
  };

  if (!stats) return <div className="p-8 text-center text-slate-400">Loading Analytics...</div>;

  const statusData = [
    { name: 'Pending',     value: stats.overview.pending,    color: STATUS_COLORS.Pending },
    { name: 'In Progress', value: stats.overview.inProgress,  color: STATUS_COLORS['In Progress'] },
    { name: 'Resolved',    value: stats.overview.resolved,   color: STATUS_COLORS.Resolved },
    { name: 'Escalated',   value: stats.overview.escalated,  color: STATUS_COLORS.Escalated },
  ];

  return (
    <div>
      <h2 className="mb-8 text-2xl font-bold">Global Analytics Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-4xl font-bold text-indigo-500 mb-2">{stats.overview.total}</h3>
          <p className="text-slate-400 text-sm font-medium">Total Complaints</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-4xl font-bold text-amber-500 mb-2">{stats.overview.pending}</h3>
          <p className="text-slate-400 text-sm font-medium">Pending</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-4xl font-bold text-emerald-500 mb-2">{stats.overview.resolved}</h3>
          <p className="text-slate-400 text-sm font-medium">Resolved</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-4xl font-bold text-rose-500 mb-2">{stats.overview.escalated}</h3>
          <p className="text-slate-400 text-sm font-medium">Escalated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="mb-6 font-semibold text-lg">Complaints by Department</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentStats}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} itemStyle={{color: '#F8FAFC'}} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="mb-6 font-semibold text-lg">Status Distribution</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend matching the cards above */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400">{entry.name}</span>
                <span className="font-semibold text-slate-200">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
