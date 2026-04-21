import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Shield, BarChart3, Bell, Users, ArrowRight, CheckCircle, AlertTriangle, FileText, LayoutDashboard, LogOut, User } from "lucide-react";

const Landing = () => {
  const { user, logout } = useContext(AuthContext);
  const features = [
    {
      icon: <Shield size={28} />,
      title: "Smart Routing",
      desc: "Complaints are auto-assigned to the correct incharge based on category and department — no manual intervention needed.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Live Analytics",
      desc: "Admin dashboard with real-time Recharts visualizing resolution rates, department breakdowns, and status distributions.",
    },
    {
      icon: <Bell size={28} />,
      title: "SLA & Escalation",
      desc: "Unresolved complaints auto-escalate to high priority after 48 hours via a background cron job — nothing slips through.",
    },
    {
      icon: <Users size={28} />,
      title: "Role-Based Access",
      desc: "Students, Teachers, Incharges, and Admins each get their own secure, tailored dashboard experience.",
    },
    {
      icon: <AlertTriangle size={28} />,
      title: "Priority Upvoting",
      desc: "Other students can upvote complaints. High upvote counts automatically escalate priority so urgent issues surface faster.",
    },
    {
      icon: <FileText size={28} />,
      title: "Media Attachments",
      desc: "Attach photos or videos as evidence when raising a complaint. Files are securely hosted on Cloudinary.",
    },
  ];

  const stats = [
    { label: "Complaints Managed", value: "500+" },
    { label: "Avg. Resolution Time", value: "< 24h" },
    { label: "Campus Departments", value: "5" },
    { label: "Active Users", value: "1,200+" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-md z-40">
        <h1 className="text-2xl font-bold text-indigo-500 flex items-center gap-2 select-none">
          <Shield size={26} /> SmartCampus
        </h1>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full pl-1 pr-1 py-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 hover:bg-slate-700/50 rounded-full pr-3 pl-1 py-1 transition-colors"
                title="Go to Dashboard"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-200 hidden sm:block">
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider hidden sm:block delay-75">
                  {user?.role}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                title="Logout"
                className="w-8 h-8 rounded-full hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer mr-1"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <CheckCircle size={15} /> Built for modern campuses
        </div>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
          Campus Complaints,
          <br />
          <span className="text-indigo-500">Resolved Smarter.</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          A unified platform where students raise issues, incharges resolve them, and admins
          track everything — powered by smart routing, SLA enforcement, and real-time analytics.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 inline-flex items-center gap-2 text-lg active:scale-95"
            >
              <LayoutDashboard size={18} /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 inline-flex items-center gap-2 text-lg active:scale-95"
              >
                Raise a Complaint <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-all text-lg"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-slate-800 bg-slate-800/30 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-indigo-400">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold text-center mb-4">Why SmartCampus?</h3>
        <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">
          Everything your campus needs to handle complaints efficiently, transparently, and
          without anything falling through the cracks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-slate-800 transition-all group"
            >
              <div className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h4 className="font-semibold text-lg mb-2">{f.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            {user ? "Welcome back!" : "Ready to get started?"}
          </h3>
          <p className="text-slate-400 mb-8 text-lg">
            {user 
              ? "View your dashboard to manage complaints and view updates." 
              : "Join hundreds of students already using SmartCampus to voice their concerns effectively."}
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2 text-lg hover:shadow-xl hover:shadow-indigo-500/25 active:scale-95"
            >
              <LayoutDashboard size={18} /> Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2 text-lg hover:shadow-xl hover:shadow-indigo-500/25 active:scale-95"
            >
              Create Your Account <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} SmartCampus Complaint Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
