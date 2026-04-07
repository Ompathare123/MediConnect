import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBars, FaTachometerAlt, FaCalendarCheck, FaUsers, FaUserMd,
  FaFlask, FaThLarge, FaStethoscope,
  FaCog, FaSignOutAlt, FaBell, FaHospitalUser, FaChevronLeft,
  FaPlusCircle, FaUserPlus, FaFileInvoice, FaChartLine, FaArrowLeft
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// --- DATA CONSTANTS ---
const trafficData = [
  { month: "Jan", patients: 120 }, { month: "Feb", patients: 190 },
  { month: "Mar", patients: 80 }, { month: "Apr", patients: 140 },
  { month: "May", patients: 100 }, { month: "Jun", patients: 170 }
];

const demographicData = [
  { name: "Doctors", value: 45 }, { name: "Patients", value: 450 }, { name: "Staff", value: 120 },
];

const COLORS = ["#1e3a8a", "#2563eb", "#93c5fd"];

// --- SUB-COMPONENTS ---

const DashboardHome = ({ quickActions, stats }) => (
  <div className="animate-fadeIn space-y-8 text-left">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: "TOTAL DOCTORS", value: stats.doctors, icon: FaUserMd, color: "text-blue-600" },
        { label: "TOTAL PATIENTS", value: stats.patients, icon: FaUsers, color: "text-blue-500" },
        { label: "APPOINTMENTS", value: stats.appointments, icon: FaCalendarCheck, color: "text-sky-600" },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800">
                {stat.value}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl bg-blue-50 ${stat.color} group-hover:bg-blue-600 group-hover:text-white transition-colors`}><stat.icon size={20} /></div>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
      <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 font-mono"><span className="w-2 h-6 bg-blue-600 rounded-full"></span> QUICK ACTIONS</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {quickActions.map((action, i) => (
          <div key={i} onClick={action.action} className="flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition-all group">
            <div className={`w-14 h-14 ${action.color} text-white rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}><action.icon size={22} /></div>
            <span className="text-xs font-bold text-slate-600 text-center">{action.label}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <h3 className="text-lg font-black text-slate-800 mb-6">Hospital Traffic</h3>
        <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={trafficData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{fill: '#f8fafc'}} /><Bar dataKey="patients" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center">
        <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">Demographics</h3>
        <div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={demographicData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{demographicData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} iconType="circle" /></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  </div>
);

const DoctorsList = ({ doctors, setView }) => (
  <div className="animate-fadeIn space-y-6 text-left pb-10">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Medical Staff</h2>
        <p className="text-slate-400 text-sm font-medium">View and manage all registered doctors in the system.</p>
      </div>
      <button onClick={() => setView("addDoctor")} className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg">
        <FaPlusCircle /> Add New Doctor
      </button>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {doc.name ? doc.name.charAt(0) : "D"}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{doc.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-medium">{doc.department}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{doc.specialization}</td>
              <td className="px-6 py-4 text-sm text-slate-500 font-bold">{doc.experience} Years</td>
              <td className="px-6 py-4 text-sm text-slate-500">{doc.email}</td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No doctors found in the database.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AddDoctorForm = ({ setView, doctorData, handleDoctorChange, handleSaveDoctor }) => (
  <div className="animate-fadeIn space-y-6 pb-10 text-left">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Add New Doctor</h2>
        <p className="text-slate-400 text-sm font-medium">Create a professional profile for a new medical staff member.</p>
      </div>
      <button onClick={() => setView("dashboard")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition shadow-sm">
        <FaArrowLeft /> Back to Dashboard
      </button>
    </div>

    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
      <div className="bg-blue-600 px-8 py-4 text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
        <FaHospitalUser /> Login Details
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">First Name</label>
          <input type="text" name="firstName" value={doctorData.firstName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Middle Name</label>
          <input type="text" name="middleName" value={doctorData.middleName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Middle Name" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Last Name</label>
          <input type="text" name="lastName" value={doctorData.lastName} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Username *</label>
          <input type="text" name="username" value={doctorData.username} onChange={handleDoctorChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Password *</label>
          <input type="password" name="password" value={doctorData.password} onChange={handleDoctorChange} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Email Address</label>
          <input type="email" name="email" value={doctorData.email} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@mail.com" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Phone Number</label>
          <input type="text" name="phone" value={doctorData.phone} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1 234 567 890" />
        </div>
      </div>

      <div className="bg-blue-600 px-8 py-4 text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
        <FaStethoscope /> Professional Details
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Department *</label>
          <select name="department" value={doctorData.department} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Department</option>
            <option value="General Checkup">General Checkup</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Specialization *</label>
          <input type="text" name="specialization" value={doctorData.specialization} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Specialization" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Experience (Years) *</label>
          <input type="number" name="experience" value={doctorData.experience} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Experience in years" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Education *</label>
          <input type="text" name="education" value={doctorData.education} onChange={handleDoctorChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., MBBS, MD" />
        </div>
      </div>
      
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
         <button onClick={handleSaveDoctor} className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg">Save Doctor</button>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [view, setView] = useState("dashboard");
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [doctors, setDoctors] = useState([]);

  const [doctorData, setDoctorData] = useState({
    firstName: "", middleName: "", lastName: "",
    username: "admin", password: "password",
    email: "", phone: "", department: "",
    specialization: "", experience: "", education: ""
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [view]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const docRes = await axios.get("http://localhost:5000/api/doctors/all", config);
      const aptRes = await axios.get("http://localhost:5000/api/appointments", config);

      const doctorsList = Array.isArray(docRes.data) ? docRes.data : [];
      const appointmentsList = Array.isArray(aptRes.data) ? aptRes.data : [];
      
      setDoctors(doctorsList);

      const uniquePatients = new Set(
        appointmentsList.map(a => a.user || a.patientName).filter(Boolean)
      ).size;

      setStats({
        doctors: doctorsList.length,
        patients: uniquePatients,
        appointments: appointmentsList.length
      });
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
    }
  };

  const handleDoctorChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handleSaveDoctor = async () => {
    if (!doctorData.firstName || !doctorData.lastName || !doctorData.email || !doctorData.password || !doctorData.department) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password, 
        phone: doctorData.phone || "", 
        department: doctorData.department,
        specialization: doctorData.specialization,
        experience: Number(doctorData.experience) || 0,
        education: doctorData.education,
        fees: 500 
      };

      const response = await axios.post("http://localhost:5000/api/doctors/add", payload);
      
      if (response.data.success) {
        alert("Doctor saved successfully!");
        fetchDashboardStats(); 
        setView("dashboard");
        setDoctorData({
          firstName: "", middleName: "", lastName: "",
          username: "admin", password: "password",
          email: "", phone: "", department: "",
          specialization: "", experience: "", education: ""
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save doctor.";
      alert(`Backend Error: ${msg}`);
    }
  };

  const menuItems = [
    { type: "label", label: "MAIN" },
    { icon: FaTachometerAlt, label: "Dashboard", viewTarget: "dashboard" },
    { icon: FaCalendarCheck, label: "Appointments" },
    { type: "label", label: "PEOPLE" },
    { icon: FaUserMd, label: "Doctors", viewTarget: "doctors" },
    { icon: FaUsers, label: "Patients" },
    { type: "label", label: "ADMIN" },
    { icon: FaThLarge, label: "Departments" },
    { icon: FaStethoscope, label: "Services" },
    { icon: FaCog, label: "Settings" },
  ];

  const quickActions = [
    { icon: FaPlusCircle, label: "Book Appointment", color: "bg-blue-600", action: () => setView("bookAppointment") },
    { icon: FaUserMd, label: "Add Doctor", color: "bg-blue-500", action: () => setView("addDoctor") },
    { icon: FaUserPlus, label: "Add Patient", color: "bg-blue-400", action: () => setView("addPatient") },
    { icon: FaFlask, label: "Laboratory", color: "bg-indigo-500" },
    { icon: FaCalendarCheck, label: "View Appointments", color: "bg-blue-700" },
    { icon: FaFileInvoice, label: "Invoices", color: "bg-sky-500" },
    { icon: FaChartLine, label: "Reports", color: "bg-blue-800" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-left">
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-700 to-blue-900 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50 shrink-0`}>
        <div className={`h-20 px-6 border-b border-blue-600/50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 whitespace-nowrap overflow-hidden italic"><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none">{isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}</button>
        </div>
        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar text-left">
          {menuItems.map((item, index) => (
            item.type === "label" ? (!isCollapsed && <p key={index} className="text-[10px] font-bold text-blue-300 px-4 mt-4 mb-1 tracking-widest uppercase">{item.label}</p>) : (
              <button 
                key={index} 
                onClick={() => { 
                    setActiveMenu(item.label); 
                    if(item.viewTarget) setView(item.viewTarget); 
                }} 
                className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-2.5 rounded-xl transition-all duration-200 ${activeMenu === item.label ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
              >
                <item.icon size={18} />{!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-blue-600/50 pt-4 text-left">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100`}>
            <FaSignOutAlt size={20} />{!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden h-screen text-left">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0">
          <div className="relative hidden md:block">
            <input type="text" placeholder="Search records..." className="bg-gray-50 border border-gray-200 rounded-full py-2 px-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all focus:w-80" />
            <FaTachometerAlt className="absolute left-4 top-3 text-gray-300 text-xs" />
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative p-2 rounded-full hover:bg-gray-50 transition cursor-pointer">
              <FaBell className="text-gray-400 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">5</span>
            </div>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100 text-right">
               <div>
                 <p className="text-sm font-bold text-gray-800 leading-none">Admin Master</p>
                 <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-tighter">Super Admin Profile</p>
               </div>
               <img src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff" alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100" />
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {view === "dashboard" && <DashboardHome quickActions={quickActions} stats={stats} />}
          {view === "doctors" && <DoctorsList doctors={doctors} setView={setView} />}
          {view === "addDoctor" && (
            <AddDoctorForm 
              setView={setView} 
              doctorData={doctorData} 
              handleDoctorChange={handleDoctorChange} 
              handleSaveDoctor={handleSaveDoctor} 
            />
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default AdminDashboard;