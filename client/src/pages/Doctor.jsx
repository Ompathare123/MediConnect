import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaSignOutAlt,
  FaBell,
  FaHospitalUser,
  FaChevronLeft
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/Doctor.css";

const appointmentsData = [
  { month: "Jan", appointments: 20 },
  { month: "Feb", appointments: 35 },
  { month: "Mar", appointments: 28 },
  { month: "Apr", appointments: 40 },
  { month: "May", appointments: 32 },
  { month: "Jun", appointments: 50 },
];

const Doctor = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/doctor-dashboard" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/doctor-appointments" },
    { icon: FaUsers, label: "My Patients", path: "/my-patients" },
    { icon: FaClock, label: "Schedule", path: "/doctor-schedule" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Matching Patient Dashboard Design */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        
        {/* SIDEBAR HEADER */}
        <div className={`h-20 px-6 border-b border-blue-500 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 whitespace-nowrap overflow-hidden">
              <FaHospitalUser />
              <span>MediConnect</span>
            </h2>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none"
          >
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              onClick={() => setActiveMenu(item.label)} 
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${activeMenu === item.label ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`} 
              title={isCollapsed ? item.label : ""}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="px-3 pb-6">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-white/10 transition-all`}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen">
        
        {/* NAVBAR - Exactly matching Patient Header */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-blue-700">Doctor Dashboard</h1>
          
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">Dr. Smith</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Hospital Staff</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" 
                alt="profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" 
              />
            </div>
          </div>
        </header>

        {/* Scrollable Main Section */}
        <main className="p-8 space-y-8 overflow-y-auto">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
            <p className="text-slate-400 text-sm">Welcome back, Dr. Smith! Here is what's happening today.</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              { title: "Pending Appointments", value: 12 }, 
              { title: "Completed Visits", value: 45 }, 
              { title: "Today's Appointments", value: 5 } 
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition duration-300 text-left">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-black mt-2 text-slate-800">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
            {/* Today's Schedule Table - ACTION COLUMN REMOVED */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-left">Today's Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-50">
                        <th className="pb-4 font-bold">Time</th>
                        <th className="pb-4 font-bold">Patient</th>
                        <th className="pb-4 font-bold">Reason</th>
                        <th className="pb-4 font-bold">Status</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="group hover:bg-gray-50 transition-colors">
                            <td className="py-5 font-semibold text-gray-700">09:00 AM</td>
                            <td className="py-5 font-bold text-blue-600">John Doe</td>
                            <td className="py-5 text-gray-500">Checkup</td>
                            <td className="py-5">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-yellow-50 text-yellow-600">
                                    Pending
                                </span>
                            </td>
                        </tr>
                        <tr className="group hover:bg-gray-50 transition-colors">
                            <td className="py-5 font-semibold text-gray-700">10:30 AM</td>
                            <td className="py-5 font-bold text-blue-600">Jane Smith</td>
                            <td className="py-5 text-gray-500">Fever</td>
                            <td className="py-5">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-50 text-green-600">
                                    Completed
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Chart Box */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Appointments Per Month</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f5f7fa'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="appointments" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Doctor;