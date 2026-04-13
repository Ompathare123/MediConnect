import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadPdfWithMobileSupport } from "../utils/pdfDownload";
import { toBackendUrl } from "../api/runtime";
import { 
  FaTachometerAlt, FaCalendarCheck, FaUsers, FaClock, 
  FaSignOutAlt, FaChevronLeft, FaBars,
  FaPlus, FaTrash, FaCheckCircle, 
  FaVideo, FaUserFriends, FaCalendarAlt, FaTimesCircle,
  FaInfoCircle, FaFileMedical, FaTimes, FaUserAlt, FaSearch, FaPrescriptionBottleAlt, FaMoneyBillWave, FaDownload,
  FaExclamationTriangle, FaHospitalUser, FaEnvelope, FaPhoneAlt, FaVenusMars,
  FaBirthdayCake, FaGraduationCap, FaIdCard, FaClinicMedical, FaStar, FaBell
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

const getTodayLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MEDICINE_SUGGESTIONS = [
  "Paracetamol",
  "Azithromycin",
  "Ibuprofen",
  "Pantoprazole",
  "Cetirizine",
  "Amoxicillin",
  "Dolo 650",
  "ORS"
];

const FREQUENCY_PRESETS = ["1-0-1", "1-1-1", "0-1-0", "1-0-0"];

const DEFAULT_WEEKLY_AVAILABILITY = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: true,
  sun: false
};

const WEEKDAY_OPTIONS = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" }
];

const getEmptyPrescription = () => ({
  chiefComplaints: "",
  diagnosis: "",
  medicines: [{ name: "", dosage: "", frequency: "1-0-1", duration: "5 days", timing: "After Food" }],
  tests: "",
  advice: "",
  followUp: "",
  allergies: ""
});

// --- SUB-COMPONENTS MOVED OUTSIDE TO FIX CURSOR/FOCUS ISSUE ---

const DashboardHome = ({ doctorName, stats, appointments, dynamicChartData, chartFilter, setChartFilter, navigateToAppointments }) => (
  <div className="animate-fadeIn space-y-8 text-left">
    <div className="text-left">
      <h2 className="text-2xl font-black text-slate-800">General Overview</h2>
      <p className="text-slate-400 text-sm">Welcome back, {doctorName}!</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <div onClick={() => navigateToAppointments("Pending")} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">PENDING APPOINTMENTS</p>
        <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.pending}</h3>
      </div>
      <div onClick={() => navigateToAppointments("Completed")} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center cursor-pointer hover:border-green-200 hover:shadow-md transition-all group">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-green-500 transition-colors">COMPLETED VISITS</p>
        <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.completed}</h3>
      </div>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">TODAY'S APPOINTMENTS</p>
        <h3 className="text-4xl font-black mt-2 text-slate-800">{stats.today}</h3>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        <h3 className="text-lg font-black text-slate-800 mb-6 text-left">Today's Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-bold text-sm text-slate-700">
              <thead><tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50"><th className="pb-4">Time</th><th className="pb-4">Patient Details</th><th className="pb-4">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
              {appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).length === 0 ? (
                  <tr><td colSpan="3" className="py-10 text-center text-slate-400 italic font-bold">No appointments for today.</td></tr>
              ) : (
                  appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).map((apt) => (
                      <tr key={apt._id}>
                          <td className="py-4">{apt.timeSlot}</td>
                          <td className="py-4"><p className="text-blue-600 font-black">{apt.patientName || "User"}</p><p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Age: {apt.age} • Blood: {apt.bloodGroup}</p></td>
                          <td className="py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${apt.status === "Pending" ? "bg-yellow-50 text-yellow-600" : apt.status === "Confirmed" ? "bg-blue-50 text-blue-600" : apt.status === "Completed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{apt.status.toUpperCase()}</span></td>
                      </tr>
                  ))
              )}
              </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800 text-left">Patient Flow</h3>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              {["Weekly", "Monthly", "Yearly"].map(f => (<button key={f} onClick={() => setChartFilter(f)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartFilter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>{f}</button>))}
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} fontSize={10} fontWeight="bold" />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
              <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={chartFilter === "Monthly" ? 10 : 35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const AppointmentManager = ({ appointments, aptSearchTerm, setAptSearchTerm, activeTab, setActiveTab, setSelectedApt, setIsWritingPrescription, setShowPrescriptionView, handleUpdateStatus }) => {
  const filteredApts = appointments.filter(apt => {
      const matchesStatus = (activeTab === "Pending") 
          ? (apt.status === "Pending" || apt.status === "Confirmed")
          : (apt.status === activeTab);
      const searchLower = aptSearchTerm.toLowerCase();
      const matchesSearch = apt.patientName?.toLowerCase().includes(searchLower) || apt.bloodGroup?.toLowerCase().includes(searchLower) || apt.appointmentDate?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fadeIn space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manage Appointments</h2><p className="text-slate-400 text-sm">Review requests</p></div>
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="relative w-full md:w-64 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><FaSearch size={14} /></div>
              <input type="text" placeholder="Search by name, blood..." value={aptSearchTerm} onChange={(e) => setAptSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300" />
           </div>
           <div className="bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 flex gap-1">
              {["Pending", "Completed", "Cancelled"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}>{tab}</button>))}
           </div>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden"><div className="overflow-x-auto p-4"><table className="w-full text-left">
        <thead><tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Patient Details</th><th className="px-8 py-5">Schedule</th><th className="px-8 py-5">Current Status</th><th className="px-8 py-5 text-center">Action</th></tr></thead>
        <tbody className="divide-y divide-gray-50 text-left">
          {filteredApts.map((apt) => (
            <tr key={apt._id} onClick={() => { setSelectedApt(apt); setIsWritingPrescription(false); setShowPrescriptionView(false); }} className="hover:bg-blue-50/20 transition-colors group cursor-pointer">
              <td className="px-8 py-6"><p className="font-black text-slate-800">{apt.patientName || "User"}</p><p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Blood: {apt.bloodGroup} • Age: {apt.age}</p></td>
              <td className="px-8 py-6"><p className="text-sm font-bold text-slate-700">{apt.appointmentDate}</p><p className="text-[11px] text-blue-600 font-black tracking-widest uppercase">{apt.timeSlot}</p></td>
              <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === "Pending" ? "bg-yellow-50 text-yellow-600" : apt.status === "Confirmed" ? "bg-blue-50 text-blue-600" : apt.status === "Completed" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{apt.status}</span></td>
              <td className="px-8 py-6"><div className="flex justify-center items-center gap-2">
                {activeTab === "Pending" && (
                  <><button onClick={(e) => handleUpdateStatus(apt._id, "Confirmed", e)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FaCheckCircle size={14} /></button>
                  <button onClick={(e) => handleUpdateStatus(apt._id, "Cancelled", e)} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"><FaTimesCircle size={14} /></button></>
                )}
                {activeTab !== "Pending" && <span className="text-[10px] text-slate-300 font-black uppercase italic">Archived</span>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
};

const PatientList = ({ appointments, searchTerm, setSearchTerm }) => {
  const uniquePatients = Array.from(new Set(appointments.map(a => a.user))).map(userId => {
      const patientApts = appointments.filter(a => a.user === userId);
      const lastApt = patientApts[0]; 
      return { id: userId, name: lastApt.patientName || "User", age: lastApt.age, bloodGroup: lastApt.bloodGroup, totalVisits: patientApts.length, lastVisit: lastApt.appointmentDate };
  });
  const filteredPatients = uniquePatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="animate-fadeIn space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Your Patients</h2><p className="text-slate-400 text-sm">List treated</p></div>
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600"><FaSearch size={14} /></div>
          <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden"><div className="overflow-x-auto p-4"><table className="w-full text-left">
        <thead><tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-8 py-5">Patient Name</th><th className="px-8 py-5 text-center">Age / Blood</th><th className="px-8 py-5 text-center">Total Visits</th><th className="px-8 py-5 text-right">Last Visit</th></tr></thead>
        <tbody className="divide-y divide-gray-50">{filteredPatients.map((p, idx) => (<tr key={idx} className="hover:bg-blue-50/20 transition-colors group"><td className="px-8 py-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><FaUserAlt size={14} /></div><p className="font-black text-slate-800">{p.name}</p></div></td><td className="px-8 py-6 text-center text-sm font-bold text-slate-600">{p.age} Yrs • {p.bloodGroup}</td><td className="px-8 py-6 text-center"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{p.totalVisits} VISITS</span></td><td className="px-8 py-6 text-right text-sm font-bold text-slate-500">{p.lastVisit}</td></tr>))}</tbody>
      </table></div></div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const DoctorDashboard = () => {
  const [view, setView] = useState("dashboard"); 
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768);
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDateString());
  const [selectedApt, setSelectedApt] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [aptSearchTerm, setAptSearchTerm] = useState(""); 
  const [activeTab, setActiveTab] = useState("Pending"); 
  const [chartFilter, setChartFilter] = useState("Weekly"); 
  
  // --- CANCELLATION MODAL STATES ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancellationNote, setCancellationNote] = useState("");

  // --- PRESCRIPTION STATES ---
  const [isWritingPrescription, setIsWritingPrescription] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(getEmptyPrescription());

  const rawName = localStorage.getItem("userName") || "Smith";
  const doctorName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;
  const doctorInitials = rawName
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] || "").toUpperCase())
    .join("") || "DR";
  const doctorProfileId = localStorage.getItem("doctorProfileId");

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, today: 0 });
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState(DEFAULT_WEEKLY_AVAILABILITY);

  const [slots, setSlots] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [formInput, setFormInput] = useState({
    startTime: "09:00", endTime: "10:00",
    maxPatients: "5", fee: "500", mode: "In-Person" 
  });

  useEffect(() => {
    fetchDoctorAppointments();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !doctorProfileId) return;

        const res = await axios.get("http://localhost:5000/api/doctors/all", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allDoctors = Array.isArray(res.data) ? res.data : [];
        const ownProfile = allDoctors.find((doc) => String(doc._id) === String(doctorProfileId));
        if (ownProfile) {
          setDoctorProfile(ownProfile);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    fetchDoctorProfile();
  }, [doctorProfileId]);

  useEffect(() => {
    if (doctorProfile?.weeklyAvailability) {
      setWeeklyAvailability({
        ...DEFAULT_WEEKLY_AVAILABILITY,
        ...doctorProfile.weeklyAvailability
      });
    }
  }, [doctorProfile]);

  const fetchDoctorAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }

        
      });
      
      const allApts = res.data;
      const todayStr = new Date().toISOString().split('T')[0];
      const myApts = allApts.filter(a => a.doctorId === doctorProfileId);

      const pending = myApts.filter(a => a.status === "Pending" || a.status === "Confirmed").length;
      const completed = myApts.filter(a => a.status === "Completed").length;
      const todayCount = myApts.filter(a => a.appointmentDate === todayStr).length;

      setAppointments(myApts);
      setStats({ pending, completed, today: todayCount });
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const dynamicChartData = useMemo(() => {
    const today = new Date();
    if (chartFilter === "Weekly") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (counts[dayName] !== undefined) counts[dayName]++;
      });
      return days.map(day => ({ name: day, appointments: counts[day] }));
    }
    if (chartFilter === "Monthly") {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthData = Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, appointments: 0 }));
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
          monthData[date.getDate() - 1].appointments++;
        }
      });
      return monthData;
    }
    if (chartFilter === "Yearly") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const yearData = months.map(m => ({ name: m, appointments: 0 }));
      appointments.forEach(apt => {
        const date = new Date(apt.appointmentDate);
        if (date.getFullYear() === today.getFullYear()) {
          yearData[date.getMonth()].appointments++;
        }
      });
      return yearData;
    }
    return [];
  }, [appointments, chartFilter]);

  const navigateToAppointments = (tabName) => {
    setActiveTab(tabName);
    setView("appointments");
  };

  const handleSidebarViewChange = (nextView) => {
    setView(nextView);
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus, e) => {
    if(e) e.stopPropagation(); 
    if (newStatus === "Cancelled") {
      setCancelTargetId(appointmentId);
      setShowCancelModal(true);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment marked as ${newStatus}.`);
      fetchDoctorAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationNote.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/appointments/${cancelTargetId}`, 
        { 
          status: "Cancelled",
          cancellationNote: cancellationNote 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment cancelled successfully.");
      setShowCancelModal(false);
      setCancellationNote("");
      fetchDoctorAppointments();
    } catch (error) {
      toast.error("Error during cancellation.");
    }
  };

  const addMedicineRow = () => {
    if (prescriptionData.medicines.length >= 10) {
      toast.error("You can add up to 10 medicines only.");
      return;
    }
    setPrescriptionData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", frequency: "1-0-1", duration: "5 days", timing: "After Food" }]
    }));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...prescriptionData.medicines];
    updated[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medicines: updated });
  };

  const removeMedicine = (index) => {
    if (prescriptionData.medicines.length === 1) {
      const resetSingle = [{ name: "", dosage: "", frequency: "1-0-1", duration: "5 days", timing: "After Food" }];
      setPrescriptionData({ ...prescriptionData, medicines: resetSingle });
      return;
    }
    const updated = prescriptionData.medicines.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medicines: updated });
  };

  const resetPrescriptionForm = () => {
    setPrescriptionData(getEmptyPrescription());
  };

  const buildNormalizedPrescriptionPayload = () => {
    const normalizedChiefComplaints = String(prescriptionData.chiefComplaints || "").trim();
    const normalizedDiagnosis = String(prescriptionData.diagnosis || "").trim();
    const normalizedTests = String(prescriptionData.tests || "").trim();
    const normalizedAdvice = String(prescriptionData.advice || "").trim();
    const normalizedFollowUp = String(prescriptionData.followUp || "").trim();
    const normalizedAllergies = String(prescriptionData.allergies || "").trim();

    const normalizedMedicines = prescriptionData.medicines
      .map((m) => ({
        name: String(m.name || "").trim(),
        dosage: String(m.dosage || "").trim(),
        frequency: String(m.frequency || "").trim(),
        duration: String(m.duration || "").trim(),
        timing: String(m.timing || "").trim() || "After Food"
      }))
      .filter((m) => m.name || m.dosage || m.frequency || m.duration);

    return {
      chiefComplaints: normalizedChiefComplaints,
      diagnosis: normalizedDiagnosis,
      medicines: normalizedMedicines,
      tests: normalizedTests,
      advice: normalizedAdvice,
      followUp: normalizedFollowUp,
      allergies: normalizedAllergies
    };
  };

  const validatePrescriptionPayload = (payload) => {
    if (!payload.chiefComplaints) {
      toast.error("Chief complaints are required.");
      return false;
    }
    if (!payload.diagnosis) {
      toast.error("Diagnosis is required.");
      return false;
    }
    if (payload.medicines.length === 0) {
      toast.error("Add at least one medicine.");
      return false;
    }

    const hasIncompleteMedicine = payload.medicines.some(
      (m) => !m.name || !m.dosage || !m.frequency || !m.duration || !m.timing
    );
    if (hasIncompleteMedicine) {
      toast.error("Each medicine row must include name, dosage, frequency, duration and timing.");
      return false;
    }

    if (payload.chiefComplaints.length > 1000 || payload.tests.length > 1000 || payload.advice.length > 1000) {
      toast.error("Symptoms, tests, and advice must be 1000 characters or less.");
      return false;
    }
    if (payload.diagnosis.length > 300 || payload.allergies.length > 300 || payload.followUp.length > 120) {
      toast.error("Diagnosis, allergies, or follow-up details are too long.");
      return false;
    }

    return true;
  };

  const downloadPrescriptionPdf = async () => {
    const payload = buildNormalizedPrescriptionPayload();
    if (!validatePrescriptionPayload(payload)) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(220, 226, 233);
    doc.rect(3, 3, pageWidth - 6, pageHeight - 6);

    doc.setFillColor(22, 124, 184);
    doc.circle(-24, -28, 86, "F");
    doc.setFillColor(177, 210, 0);
    doc.circle(-10, -34, 76, "F");

    doc.setFillColor(22, 124, 184);
    doc.circle(pageWidth + 18, pageHeight + 18, 62, "F");
    doc.setFillColor(177, 210, 0);
    doc.circle(pageWidth + 12, pageHeight + 12, 56, "F");

    doc.setTextColor(236, 241, 247);
    doc.setFontSize(44);
    doc.text("MediConnect", pageWidth / 2, pageHeight / 2, { align: "center", angle: 32 });

    doc.setTextColor(104, 171, 206);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MediConnect Hospital", pageWidth - 18, 18, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Compassionate Care, Advanced Medicine", pageWidth - 18, 26, { align: "right" });
    doc.setFontSize(9.5);
    doc.setTextColor(130, 130, 130);
    doc.text("City Care Road, Pune", pageWidth - 18, 36, { align: "right" });
    doc.text("+91 98765 43210  |  mediconnect.health", pageWidth - 18, 42, { align: "right" });

    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Name:", 62, 60);
    doc.text("Age:", 62, 70);
    doc.text("Sex:", 108, 70);
    doc.text("Date:", 146, 70);

    doc.setLineDashPattern([1, 1], 0);
    doc.line(78, 60, pageWidth - 18, 60);
    doc.line(74, 70, 103, 70);
    doc.line(117, 70, 142, 70);
    doc.line(158, 70, pageWidth - 18, 70);
    doc.setLineDashPattern([], 0);

    const sexValue = String(selectedApt?.gender || selectedApt?.sex || "Not Mentioned");
    doc.setTextColor(40, 40, 40);
    doc.text(selectedApt?.patientName || "-", 80, 59.5);
    doc.text(String(selectedApt?.age || "-"), 76, 69.5);
    doc.text(sexValue, 118, 69.5);
    doc.text(new Date().toLocaleDateString(), 160, 69.5);

    let cursorY = 82;
    const drawSection = (label, value) => {
      const safeValue = value && String(value).trim() ? String(value).trim() : "-";
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 30, cursorY);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(safeValue, pageWidth - 84);
      doc.text(wrapped, 78, cursorY);
      cursorY += Math.max(8, wrapped.length * 5 + 2);
    };

    drawSection("Chief Complaints", payload.chiefComplaints);
    drawSection("Diagnosis", payload.diagnosis);
    drawSection("Tests", payload.tests);
    drawSection("Allergies", payload.allergies);
    drawSection("Follow-up", payload.followUp);

    autoTable(doc, {
      startY: cursorY + 2,
      head: [["Medicine", "Dosage", "Frequency", "Duration", "Timing"]],
      body: payload.medicines.map((m) => [m.name, m.dosage, m.frequency, m.duration, m.timing]),
      theme: "striped",
      headStyles: { fillColor: [22, 124, 184], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 249, 255] },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setTextColor(30);
    doc.setFont("helvetica", "bold");
    doc.text("Doctor Advice:", 20, finalY);
    doc.setFont("helvetica", "normal");
    const wrappedAdvice = doc.splitTextToSize(payload.advice || "-", pageWidth - 40);
    doc.text(wrappedAdvice, 20, finalY + 6);

    const signatureY = Math.min(pageHeight - 16, finalY + Math.max(16, wrappedAdvice.length * 5 + 12));
    doc.setDrawColor(120, 120, 120);
    doc.line(pageWidth - 75, signatureY, pageWidth - 20, signatureY);
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Doctor Signature", pageWidth - 20, signatureY + 5, { align: "right" });

    const fileName = `Prescription_${(selectedApt?.patientName || "Patient").replace(/\s+/g, "_")}.pdf`;
    await downloadPdfWithMobileSupport(doc, fileName);
  };

  const savePrescription = async () => {
    if (isSavingPrescription) return;
    const payload = buildNormalizedPrescriptionPayload();
    if (!validatePrescriptionPayload(payload)) return;

    try {
      setIsSavingPrescription(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/appointments/${selectedApt._id}/prescription`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Prescription saved and visit completed.");
      setIsWritingPrescription(false);
      resetPrescriptionForm();
      fetchDoctorAppointments();
      setSelectedApt(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save prescription.");
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({ ...prev, [name]: value }));
  };

  const fetchScheduleForSelectedDate = async () => {
    if (!doctorProfileId || !selectedDate) {
      setSlots([]);
      return;
    }

    setLoadingSchedule(true);
    try {
      const res = await axios.get("http://localhost:5000/api/schedule/get", {
        params: {
          doctorId: doctorProfileId,
          date: selectedDate,
          includeExpired: true
        }
      });

      const dateSlots = Array.isArray(res.data) ? res.data : [];
      const normalizedSlots = dateSlots.map((slot, index) => ({
        id: slot._id || `${selectedDate}-${index}-${slot.time}`,
        date: selectedDate,
        time: slot.time,
        mode: slot.mode || "In-Person",
        max: String(slot.maxPatients ?? 0),
        fee: String(slot.fee ?? 0),
        status: slot.status || "Active"
      }));

      setSlots(normalizedSlots);
    } catch (error) {
      console.error("Error fetching schedule by date:", error);
      setSlots([]);
      toast.error("Failed to load schedule for selected date.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (view === "schedule") {
      fetchScheduleForSelectedDate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, doctorProfileId, view]);

  const saveScheduleToDB = async () => {
    if (!doctorProfileId) {
      toast.error("Doctor profile ID not found. Please login again.");
      return;
    }

    const slotsForSelectedDate = slots.filter((s) => s.date === selectedDate);

    const hasInvalidDate = slotsForSelectedDate.some((s) => !s.date);
    if (hasInvalidDate) {
      toast.error("Each slot must have a schedule date.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/schedule/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctorProfileId,
          date: selectedDate,
          weeklyAvailability,
          slots: slotsForSelectedDate.map((s) => ({
            time: s.time,
            mode: s.mode,
            maxPatients: s.max,
            fee: s.fee,
            status: "Active"
          }))
        })
      });

      if (response.ok) {
        toast.success("Schedule and availability saved successfully.");
        fetchScheduleForSelectedDate();
        setDoctorProfile((prev) => prev ? ({ ...prev, weeklyAvailability: { ...weeklyAvailability } }) : prev);
      } else {
        toast.error("Failed to save schedule.");
      }
    } catch (err) {
      toast.error("Server error.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const addSlotToList = () => {
    const newSlot = { 
        id: Date.now(), 
        date: selectedDate,
        time: `${formInput.startTime} - ${formInput.endTime}`, 
        mode: formInput.mode, 
        max: formInput.maxPatients, 
        fee: formInput.fee, 
        status: "Active" 
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const deleteSlot = (id) => setSlots((prev) => prev.filter((slot) => slot.id !== id));

  const handleScheduleDateChange = (value) => {
    const minDate = getTodayLocalDateString();
    if (value && value < minDate) {
      toast.error("You cannot create schedule for a past date.");
      return;
    }
    setSelectedDate(value);
  };

  const handleWeekAvailabilityToggle = (dayKey) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const renderScheduleManager = () => (
    <div className="animate-fadeIn space-y-6 pb-10 text-left">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manage Schedule</h2><p className="text-slate-400 text-sm">Set availability for upcoming appointments</p></div>
        <button type="button" onClick={saveScheduleToDB} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"><FaCheckCircle /> Save Schedule</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-4 uppercase flex items-center gap-2"><FaCalendarAlt className="text-blue-600" /> Select Date</h3>
            <input type="date" min={getTodayLocalDateString()} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" value={selectedDate} onChange={(e) => handleScheduleDateChange(e.target.value)} />
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-800 mb-3 uppercase flex items-center gap-2"><FaClock className="text-blue-600" /> Weekly Availability</h3>
            <div className="space-y-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const enabled = Boolean(weeklyAvailability[day.key]);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleWeekAvailabilityToggle(day.key)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50/70 transition"
                  >
                    <span className="text-sm font-bold text-slate-700">{day.short}</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${enabled ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                      {enabled ? "Available" : "Not Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Start</label><input type="time" name="startTime" value={formInput.startTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">End</label><input type="time" name="endTime" value={formInput.endTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Max Patients</label><input type="number" name="maxPatients" value={formInput.maxPatients} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Consultation Mode</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    {["In-Person", "Video"].map(m => (
                        <button 
                          type="button"
                            key={m} 
                            onClick={() => setFormInput({...formInput, mode: m})}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formInput.mode === m ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            {m === "Video" ? <FaVideo size={10}/> : <FaUserFriends size={10}/>} {m}
                        </button>
                    ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Consultation Fee (₹)</label>
                <div className="relative">
                    <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={14}/>
                    <input type="number" name="fee" value={formInput.fee} onChange={handleInputChange} placeholder="500" className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-700" />
                </div>
              </div>
            </div>
            <button type="button" onClick={addSlotToList} className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-xl"><FaPlus /> Add Time Slot</button>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Schedule Preview</h3>
                {slots.length > 0 && <button type="button" onClick={() => setSlots([])} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><FaTrash /> Clear All</button>}
            </div>
            <div className="p-4">
              {loadingSchedule ? <div className="p-10 text-center text-slate-300 font-bold italic">Loading schedule...</div> : slots.length === 0 ? <div className="p-10 text-center text-slate-300 font-bold italic">No slots added.</div> : (
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50 text-gray-400 text-[10px] font-black uppercase tracking-widest"><th className="px-6 py-4">Date</th><th className="px-6 py-4">Time Slot</th><th className="px-6 py-4">Mode</th><th className="px-6 py-4">Fee</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                    {slots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{slot.date || "-"}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{slot.time}</td>
                            <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full w-fit uppercase ${slot.mode === "Video" ? "text-purple-600 bg-purple-50" : "text-blue-600 bg-blue-50"}`}>
                                    {slot.mode === "Video" ? <FaVideo /> : <FaUserFriends />} {slot.mode}
                                </span>
                            </td>
                            <td className="px-6 py-4"><span className="text-sm font-black text-green-600">₹{slot.fee}</span></td>
                            <td className="px-6 py-4 text-center"><button type="button" onClick={() => deleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={14} /></button></td>
                        </tr>
                    ))}
                </tbody>
              </table>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorProfile = () => {
    const displayName = doctorProfile?.name || doctorName;
    const specialization = doctorProfile?.specialization || doctorProfile?.department || "General Physician";
    const email = doctorProfile?.email || "Not available";
    const phone = doctorProfile?.phone || "Not available";
    const education = doctorProfile?.education || "Qualification not added";
    const experience = doctorProfile?.experience ? `${doctorProfile.experience}+` : "0";
    const initials = displayName
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "DR";

    const weeklyAvailability = [
      { day: "Mon", time: "09:00 - 12:00", available: true },
      { day: "Tue", time: "10:00 - 14:00", available: true },
      { day: "Wed", time: "09:00 - 13:00", available: true },
      { day: "Thu", time: "Off", available: false },
      { day: "Fri", time: "11:00 - 16:00", available: true },
      { day: "Sat", time: "09:00 - 12:00", available: true },
      { day: "Sun", time: "Off", available: false }
    ];

    return (
      <div className="animate-fadeIn space-y-6 text-left">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 xl:grid-cols-[300px_1fr]">
          <div className="bg-gradient-to-br from-[#edf3ff] to-[#dbe9ff] p-8 border-r border-blue-100 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center text-5xl font-black border-4 border-white shadow-lg relative">
              {initials}
              <span className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs">📷</span>
            </div>
            <p className="mt-4 text-emerald-600 text-sm font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Available Now</p>
            <h3 className="mt-2 text-4xl font-black text-slate-800">{displayName}</h3>
            <p className="mt-2 px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black">{specialization}</p>

            <div className="mt-6 w-full grid grid-cols-3 gap-3 text-center">
              <div><p className="text-3xl font-black text-slate-800">{experience}</p><p className="text-[11px] text-slate-500 font-bold">Years Exp.</p></div>
              <div><p className="text-3xl font-black text-slate-800">{appointments.length || 1240}</p><p className="text-[11px] text-slate-500 font-bold">Patients</p></div>
              <div><p className="text-3xl font-black text-slate-800">96%</p><p className="text-[11px] text-slate-500 font-bold">Success</p></div>
            </div>

            <div className="mt-6 flex items-center gap-1 text-amber-500">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="opacity-40" />
              <span className="ml-2 text-slate-700 font-black text-base">4.8</span>
            </div>

            <div className="mt-6 w-full space-y-3">
              <button type="button" className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">✏️ Edit Profile</button>
              <button type="button" onClick={() => setView("schedule")} className="w-full py-3 border border-blue-600 text-blue-700 rounded-xl text-sm font-black hover:bg-blue-50 transition">🗓️ Update Availability</button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-3xl font-black text-slate-800">Doctor Information</h3>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">● Active</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaUserAlt className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Full Name</p><p className="text-xl font-black text-slate-800">{displayName}</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaEnvelope className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Email Address</p><p className="text-xl font-black text-slate-800">{email}</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaPhoneAlt className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Phone Number</p><p className="text-xl font-black text-slate-800">{phone}</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaVenusMars className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Gender</p><p className="text-xl font-black text-slate-800">Male</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaBirthdayCake className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Date of Birth</p><p className="text-xl font-black text-slate-800">March 15, 1986</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaGraduationCap className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Qualification</p><p className="text-xl font-black text-slate-800">{education}</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaIdCard className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">License Number</p><p className="text-xl font-black text-slate-800">MCI-{String(doctorProfile?._id || "0000").slice(-6).toUpperCase()}</p></div></div>
              <div className="bg-[#eef3ff] border border-blue-100 rounded-xl p-4 flex items-start gap-3"><FaClinicMedical className="text-blue-600 mt-1" /><div><p className="text-[11px] text-slate-500">Hospital / Clinic</p><p className="text-xl font-black text-slate-800">MediConnect Hospital, Pune</p></div></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-7">
          <h4 className="text-2xl font-black text-slate-800">About the Doctor</h4>
          <p className="mt-3 text-slate-600 leading-relaxed text-sm">
            {displayName} is a distinguished specialist with extensive clinical experience in preventive care and patient-first treatment planning. Known for clear communication and evidence-based practice, the doctor has helped thousands of patients with compassionate and modern healthcare.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">Interventional Care</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">Echo Cardiography</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700">Preventive Care</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700">Cardiac Rehab</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6"><p className="text-4xl font-black text-slate-800">{appointments.length || 1240}</p><p className="text-sm font-bold text-slate-500">Total Patients</p><p className="text-xs font-black text-emerald-600 mt-1">↑ 12% this month</p></div>
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6"><p className="text-4xl font-black text-slate-800">{appointments.length || 348}</p><p className="text-sm font-bold text-slate-500">Total Appointments</p><p className="text-xs font-black text-emerald-600 mt-1">↑ 8% this week</p></div>
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6"><p className="text-4xl font-black text-slate-800">{stats.completed || 1192}</p><p className="text-sm font-bold text-slate-500">Completed Consultations</p><p className="text-xs font-black text-emerald-600 mt-1">96.1% success rate</p></div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-7">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-2xl font-black text-slate-800">Weekly Availability</h4>
            <button type="button" onClick={() => setView("schedule")} className="px-4 py-2 border border-blue-600 rounded-xl text-xs font-black text-blue-700 hover:bg-blue-50 transition">Edit Schedule</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {weeklyAvailability.map((day) => (
              <div key={day.day} className="rounded-xl border border-blue-100 overflow-hidden">
                <div className={`text-center py-2 text-xs font-black ${day.available ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{day.day}</div>
                <div className="p-3 text-center bg-white">
                  <p className="text-[11px] font-bold text-slate-600">{day.time}</p>
                  <div className="mt-2 flex justify-center">
                    <span className={`w-8 h-4 rounded-full ${day.available ? "bg-blue-600" : "bg-slate-300"} relative`}>
                      <span className={`absolute top-[2px] w-3 h-3 rounded-full bg-white ${day.available ? "right-[2px]" : "left-[2px]"}`} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-7">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-2xl font-black text-slate-800">Patient Reviews</h4>
            <p className="text-sm font-bold text-slate-500">4.8 avg from 284 reviews</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "Priya Rao", text: "Explained my condition clearly and answered every question.", date: "Apr 2, 2026", color: "bg-blue-500" },
              { name: "Anil Mehta", text: "Professional and empathetic. Excellent post-op guidance.", date: "Mar 28, 2026", color: "bg-emerald-500" },
              { name: "Sneha Kulkarni", text: "Outstanding diagnostic skills. Highly recommended specialist.", date: "Mar 20, 2026", color: "bg-indigo-500" },
              { name: "Ravi Joshi", text: "Consultation was detailed and treatment plan was clear.", date: "Mar 14, 2026", color: "bg-amber-500" }
            ].map((review) => (
              <div key={review.name} className="border border-blue-100 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full text-white text-xs font-black flex items-center justify-center ${review.color}`}>{review.name.split(" ").map((v) => v[0]).join("")}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{review.name}</p>
                      <div className="flex items-center gap-1 text-amber-500 text-xs"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">{review.date}</p>
                </div>
                <p className="text-sm text-slate-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#edf4ff] font-sans text-left relative overflow-x-hidden">
      <div className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:static inset-y-0 left-0 bg-gradient-to-b from-blue-700 to-blue-900 text-white min-h-screen shadow-2xl transition-all duration-300 flex flex-col z-50 shrink-0`}>
        <div className={`h-20 px-6 border-b border-blue-600/50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 italic"><FaHospitalUser /><span>MediConnect</span></h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">{isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}</button>
        </div>
        <nav className="mt-8 px-3 space-y-2 flex-1">
          {[{ icon: FaTachometerAlt, label: "Dashboard", id: "dashboard" }, { icon: FaCalendarCheck, label: "Appointments", id: "appointments" }, { icon: FaUsers, label: "Patients", id: "patients" }, { icon: FaClock, label: "Schedule", id: "schedule" }].map((item) => (
            <button key={item.id} onClick={() => handleSidebarViewChange(item.id)} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${view === item.id ? "bg-white/20 shadow-inner text-white" : "text-blue-100 hover:bg-white/10"}`}>
              <div className="flex-shrink-0"><item.icon size={20} /></div>{!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-8"><button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}><div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>{!isCollapsed && <span className="text-sm font-medium">Logout</span>}</button></div>
      </div>

      {!isCollapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col transition-all duration-300 overflow-hidden min-h-screen text-left w-full">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-4 md:px-10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-gray-200 text-slate-600"
              onClick={() => setIsCollapsed(false)}
              aria-label="Open sidebar"
            >
              <FaBars size={16} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{view === "dashboard" ? "Doctor Dashboard" : view === "profile" ? "Doctor Profile" : view.toUpperCase()}</h2>
              {view === "profile" && (
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Home &gt; <span className="text-blue-600">Profile</span></p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {view === "profile" && (
              <>
                <button type="button" className="w-9 h-9 rounded-xl border border-gray-200 text-slate-500 hover:bg-slate-50 transition flex items-center justify-center"><FaBell size={13} /></button>
                <button type="button" className="w-9 h-9 rounded-xl border border-gray-200 text-slate-500 hover:bg-slate-50 transition flex items-center justify-center"><FaSearch size={13} /></button>
              </>
            )}
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100 text-right">
              <div>
                <p className="text-sm font-bold text-gray-800 leading-none">{doctorName}</p>
                <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-tighter">Hospital Staff</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-blue-100 bg-blue-600 text-white flex items-center justify-center text-sm font-black">
                {doctorInitials}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-10 overflow-y-auto bg-gradient-to-b from-[#edf4ff] via-[#f5f9ff] to-[#edf4ff] flex-1 custom-scrollbar">
          {view === "dashboard" ? (
            <DashboardHome 
              doctorName={doctorName} 
              stats={stats} 
              appointments={appointments} 
              dynamicChartData={dynamicChartData} 
              chartFilter={chartFilter} 
              setChartFilter={setChartFilter} 
              navigateToAppointments={navigateToAppointments} 
            />
          ) : view === "appointments" ? (
            <AppointmentManager 
              appointments={appointments} 
              aptSearchTerm={aptSearchTerm} 
              setAptSearchTerm={setAptSearchTerm} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              setSelectedApt={setSelectedApt} 
              setIsWritingPrescription={setIsWritingPrescription} 
              setShowPrescriptionView={setShowPrescriptionView} 
              handleUpdateStatus={handleUpdateStatus} 
            />
          ) : view === "patients" ? (
            <PatientList appointments={appointments} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          ) : view === "schedule" ? (
            renderScheduleManager()
          ) : view === "profile" ? (
            renderDoctorProfile()
          ) : (
            <div className="text-center p-20 text-slate-400 font-bold italic">Coming soon.</div>
          )}
        </main>
      </div>

      {/* --- CANCELLATION MODAL --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center relative mx-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 px-4">Please provide a reason for the patient regarding this cancellation.</p>
            <div className="text-left mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Reason for Cancellation</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all resize-none"
                rows="4"
                placeholder="e.g. Doctor is out of town / Incorrect department..."
                value={cancellationNote}
                onChange={(e) => setCancellationNote(e.target.value)}
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button onClick={confirmCancellation} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100">Confirm Cancellation</button>
              <button onClick={() => { setShowCancelModal(false); setCancellationNote(""); }} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* --- APPOINTMENT DETAILS MODAL --- */}
      {selectedApt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-2xl font-black tracking-tight">{isWritingPrescription ? "Write Prescription" : showPrescriptionView ? "Patient Prescription" : "Patient Case Details"}</h3><p className="text-blue-100 text-sm font-medium mt-1">Patient: {selectedApt.patientName}</p></div>
              <button onClick={() => { setSelectedApt(null); setIsWritingPrescription(false); setShowPrescriptionView(false); resetPrescriptionForm(); }} className="text-white/80 hover:text-white transition-colors"><FaTimes size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
              {showPrescriptionView ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Chief Complaints</p><p className="text-sm text-slate-700">{selectedApt.prescription?.chiefComplaints || "-"}</p></div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Diagnosis</p><p className="text-sm text-slate-700">{selectedApt.prescription?.diagnosis || "-"}</p></div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Prescribed Medicines</h4>
                    <div className="space-y-3">
                      {(selectedApt.prescription?.medicines || []).map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                          <div>
                            <p className="font-bold text-slate-800">{med.name}</p>
                            <p className="text-[10px] font-black text-blue-600 uppercase">{med.timing} • {med.frequency || "-"} • {med.duration || "-"}</p>
                          </div>
                          <p className="text-xs font-black text-slate-500 uppercase">{med.dosage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedApt.prescription?.tests && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tests / Investigations</p>
                        <p className="text-sm text-slate-600">{selectedApt.prescription.tests}</p>
                    </div>
                  )}
                  {selectedApt.prescription?.advice && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Advice</p>
                        <p className="text-sm text-slate-600 italic">"{selectedApt.prescription.advice}"</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Follow-Up</p><p className="text-sm text-slate-700">{selectedApt.prescription?.followUp || "-"}</p></div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Allergies</p><p className="text-sm text-slate-700">{selectedApt.prescription?.allergies || "-"}</p></div>
                  </div>
                  <button onClick={() => setShowPrescriptionView(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Back to Details</button>
                </div>
              ) : !isWritingPrescription ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Blood Group</p><p className="font-bold text-slate-800">{selectedApt.age} Years • {selectedApt.bloodGroup}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p><p className="font-bold text-blue-600 uppercase tracking-tighter">{selectedApt.timeSlot}</p></div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2"><FaInfoCircle className="text-blue-600" size={14} /><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reported Symptoms</p></div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedApt.symptoms || "No symptoms described."}"</p>
                  </div>
                  <div className="pt-2 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments</p>
                    {selectedApt.medicalReport && (
                        <a href={toBackendUrl(`/uploads/${selectedApt.medicalReport}`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl group hover:bg-blue-600 transition-all">
                        <div className="flex items-center gap-3"><FaFileMedical size={18} className="text-blue-600 group-hover:text-white" /><p className="text-sm font-bold text-slate-700 group-hover:text-white">View Medical Report</p></div>
                        <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1.5 rounded-lg uppercase group-hover:bg-blue-700 group-hover:text-white transition-colors shadow-sm">View File</span>
                        </a>
                    )}
                    {selectedApt.status === "Completed" && selectedApt.prescription && (
                        <div onClick={() => setShowPrescriptionView(true)} className="flex items-center justify-between bg-green-50 border border-green-100 p-4 rounded-2xl group hover:bg-green-600 transition-all cursor-pointer">
                        <div className="flex items-center gap-3"><FaPrescriptionBottleAlt size={18} className="text-green-600 group-hover:text-white" /><p className="text-sm font-bold text-slate-700 group-hover:text-white">View Prescription</p></div>
                        <span className="text-[10px] font-black text-green-600 bg-white px-3 py-1.5 rounded-lg uppercase group-hover:bg-green-700 group-hover:text-white transition-colors shadow-sm">View Details</span>
                        </div>
                    )}
                  </div>
                  {selectedApt.status !== "Completed" && selectedApt.status !== "Cancelled" && (
                    <button onClick={() => { setIsWritingPrescription(true); resetPrescriptionForm(); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"><FaPrescriptionBottleAlt /> Start Prescription</button>
                  )}
                  <button onClick={() => setSelectedApt(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg">Close Case</button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Chief Complaints</label>
                    <textarea rows="3" value={prescriptionData.chiefComplaints} onChange={(e) => setPrescriptionData({ ...prescriptionData, chiefComplaints: e.target.value })} placeholder="Enter symptoms (e.g., fever, cough, headache)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white"></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Diagnosis</label>
                    <input type="text" value={prescriptionData.diagnosis} onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })} placeholder="Enter diagnosis (e.g., Viral Fever)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white" />
                  </div>

                  <div className="flex justify-between items-center"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medicines</h4><button type="button" onClick={addMedicineRow} className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><FaPlus /> Add Medicine</button></div>
                  {prescriptionData.medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                      <div className="col-span-12 md:col-span-4 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Medicine Name</label>
                        <>
                          <input list={`medicine-list-${index}`} type="text" value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                          <datalist id={`medicine-list-${index}`}>
                            {MEDICINE_SUGGESTIONS.map((name) => <option key={name} value={name} />)}
                          </datalist>
                        </>
                      </div>
                      <div className="col-span-6 md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Dosage</label><input type="text" value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} placeholder="500mg" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" /></div>
                      <div className="col-span-6 md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Frequency</label><input type="text" value={med.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)} placeholder="1-0-1" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" /></div>
                      <div className="col-span-6 md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Duration</label><input type="text" value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} placeholder="5 days" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" /></div>
                      <div className="col-span-6 md:col-span-1 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Timing</label><select value={med.timing} onChange={(e) => updateMedicine(index, 'timing', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold"><option>After Food</option><option>Before Food</option></select></div>
                      <div className="col-span-1"><button type="button" onClick={() => removeMedicine(index)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><FaTrash size={14} /></button></div>
                      <div className="col-span-12 flex flex-wrap gap-2">
                        {FREQUENCY_PRESETS.map((freq) => (
                          <button key={freq} type="button" onClick={() => updateMedicine(index, 'frequency', freq)} className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${med.frequency === freq ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Tests / Investigations</label><textarea rows="2" placeholder="Recommended tests (e.g., Blood test, X-ray)" value={prescriptionData.tests} onChange={(e) => setPrescriptionData({ ...prescriptionData, tests: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white" maxLength={1000}></textarea></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Doctor's Advice</label><textarea rows="3" placeholder="Additional instructions..." value={prescriptionData.advice} onChange={(e) => setPrescriptionData({...prescriptionData, advice: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white" maxLength={1000}></textarea></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Follow-Up</label><input type="text" value={prescriptionData.followUp} onChange={(e) => setPrescriptionData({ ...prescriptionData, followUp: e.target.value })} placeholder="Follow-up after (e.g., 5 days)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white" maxLength={120} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Allergies (Optional)</label><input type="text" value={prescriptionData.allergies} onChange={(e) => setPrescriptionData({ ...prescriptionData, allergies: e.target.value })} placeholder="Any known allergies" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:bg-white" maxLength={300} /></div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={savePrescription} disabled={isSavingPrescription} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-60 disabled:cursor-not-allowed"><FaCheckCircle /> {isSavingPrescription ? "Saving..." : "Save & Finish"}</button>
                    <button type="button" onClick={downloadPrescriptionPdf} disabled={isSavingPrescription} className="px-5 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"><FaDownload /> Preview / PDF</button>
                    <button type="button" onClick={() => setIsWritingPrescription(false)} disabled={isSavingPrescription} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all disabled:opacity-60">Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }` }} />
    </div>
  );
};

export default DoctorDashboard;