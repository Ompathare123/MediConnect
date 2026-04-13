import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars, FaTachometerAlt, FaCalendarPlus, FaCalendarCheck,
  FaFilePrescription, FaUser, FaSignOutAlt, FaChevronLeft,
  FaHospitalUser, FaSave,
  FaHistory, FaPills, FaFileMedicalAlt, FaShieldAlt, FaPlus, FaTrash
} from "react-icons/fa";

const PatientProfile = () => {
  const navigate = useNavigate();

  // --- SIDEBAR STATE ---
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- DYNAMIC FORM STATE ---
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("patientFullProfile");
    return savedData ? JSON.parse(savedData) : {
      name: localStorage.getItem("userName") || "",
      age: localStorage.getItem("patientAge") || "",
      bloodGroup: localStorage.getItem("patientBloodGroup") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: "",
      address: "",
      insuranceProvider: "",
      policyNumber: "",
      emergencyName: "",
      emergencyPhone: "",
      allergies: "",
      chronicConditions: "",
      medicalHistory: [""],
      medications: [{ name: "", dose: "", freq: "" }]
    };
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- DYNAMIC LIST HANDLERS ---
  const addHistoryRow = () => setFormData({...formData, medicalHistory: [...formData.medicalHistory, ""]});
  const removeHistoryRow = (index) => {
    const list = [...formData.medicalHistory];
    list.splice(index, 1);
    setFormData({...formData, medicalHistory: list});
  };
  const handleHistoryChange = (index, val) => {
    const list = [...formData.medicalHistory];
    list[index] = val;
    setFormData({...formData, medicalHistory: list});
  };

  const addMedRow = () => setFormData({...formData, medications: [...formData.medications, {name: "", dose: "", freq: ""}]});
  const removeMedRow = (index) => {
    const list = [...formData.medications];
    list.splice(index, 1);
    setFormData({...formData, medications: list});
  };
  const handleMedChange = (index, field, val) => {
    const list = [...formData.medications];
    list[index][field] = val;
    setFormData({...formData, medications: list});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic API delay
    setTimeout(() => {
      localStorage.setItem("patientFullProfile", JSON.stringify(formData));
      localStorage.setItem("userName", formData.name);
      localStorage.setItem("patientAge", formData.age);
      localStorage.setItem("patientBloodGroup", formData.bloodGroup);
      
      setMessage({ type: "success", text: "Medical Profile Saved Successfully!" });
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", active: true, path: "/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#edf4ff] overflow-x-hidden text-left relative">
      {/* Sidebar */}
      <div className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:static inset-y-0 left-0 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className={`h-20 px-6 border-b border-blue-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0`}>
          {!isCollapsed && <h2 className="text-xl font-bold flex items-center space-x-3 italic whitespace-nowrap overflow-hidden"><FaHospitalUser /><span>MediConnect</span></h2>}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none cursor-pointer"
          >
            {isCollapsed ? <FaBars size={20} /> : <FaChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? "bg-white/20 shadow-inner" : "hover:bg-white/10"}`}
              title={isCollapsed ? item.label : ""}
            >
              <div className="flex-shrink-0"><item.icon size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-blue-500/50 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all`}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-4 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-gray-200 text-slate-600"
              onClick={() => setIsCollapsed(false)}
              aria-label="Open sidebar"
            >
              <FaBars size={16} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-blue-700">Medical Profile</h1>
          </div>
          <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
            <img src={`https://ui-avatars.com/api/?name=${formData.name}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" />
            <div className="text-left hidden sm:block"><p className="text-sm font-bold text-gray-800 leading-none">{formData.name || "User"}</p><p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#edf4ff] via-[#f5f9ff] to-[#edf4ff] p-4 md:p-8 custom-scrollbar">
          <form onSubmit={handleSave} className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">

            {message.text && (
              <div className={`p-4 rounded-2xl font-bold text-sm ${message.type === "success" ? "bg-green-100 text-green-700 shadow-sm" : "bg-red-50 text-red-600"}`}>{message.text}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Identity Snapshot */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
                  <img src={`https://ui-avatars.com/api/?name=${formData.name}&size=128&background=random&color=fff`} className="w-32 h-32 rounded-[2rem] mx-auto mb-6 border-4 border-blue-50 shadow-md object-cover" alt="avatar" />
                  <h3 className="text-xl font-black text-slate-800">{formData.name || "Patient Name"}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Verified Patient</p>

                  <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</p>
                      <p className="text-sm font-black text-slate-700 mt-1">{formData.bloodGroup || "-"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</p>
                      <p className="text-sm font-black text-slate-700 mt-1">{formData.age || "-"}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">History Records</p>
                      <p className="text-sm font-black text-blue-700 mt-1">{formData.medicalHistory.filter(Boolean).length}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Medications</p>
                      <p className="text-sm font-black text-green-700 mt-1">{formData.medications.filter((m) => m.name).length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Medical Profile */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-gray-50 pb-4">Personal And Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label><input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="City, State" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-gray-50 pb-4">Emergency And Insurance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact Name</label><input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} placeholder="Emergency person name" className="w-full bg-red-50 rounded-2xl px-4 py-3 text-sm font-bold text-red-700 border border-red-100 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact Phone</label><input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} placeholder="Phone number" className="w-full bg-red-50 rounded-2xl px-4 py-3 text-sm font-bold text-red-700 border border-red-100 outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaShieldAlt className="text-blue-500" /> Insurance Provider</label><input type="text" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} placeholder="Provider Name" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Number</label><input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleInputChange} placeholder="Policy Number" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Editable Medical History */}
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaHistory className="text-blue-500"/> History</h4>
                        <button type="button" onClick={addHistoryRow} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><FaPlus size={10}/></button>
                    </div>
                    <div className="space-y-2">
                      {formData.medicalHistory.map((h, i) => (
                        <div key={i} className="flex gap-2">
                           <input value={h} onChange={(e) => handleHistoryChange(i, e.target.value)} placeholder="e.g. Surgery (2020)" className="w-full text-xs font-bold bg-slate-50 p-2 rounded-lg border-none outline-none" />
                           <button type="button" onClick={() => removeHistoryRow(i)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTrash size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editable Medications */}
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaPills className="text-green-500"/> Medications</h4>
                        <button type="button" onClick={addMedRow} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><FaPlus size={10}/></button>
                    </div>
                    <div className="space-y-3">
                      {formData.medications.map((m, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2 relative">
                           <button type="button" onClick={() => removeMedRow(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><FaTrash size={10}/></button>
                           <input value={m.name} onChange={(e) => handleMedChange(i, 'name', e.target.value)} placeholder="Medicine Name" className="w-full bg-transparent text-xs font-black outline-none border-b border-slate-200 pb-1" />
                           <div className="flex gap-2">
                             <input value={m.dose} onChange={(e) => handleMedChange(i, 'dose', e.target.value)} placeholder="Dosage" className="w-1/2 bg-transparent text-[10px] font-bold outline-none" />
                             <input value={m.freq} onChange={(e) => handleMedChange(i, 'freq', e.target.value)} placeholder="Freq" className="w-1/2 bg-transparent text-[10px] font-bold outline-none" />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FaFileMedicalAlt className="text-purple-500"/> Health Conditions</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Allergies</label><textarea name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="e.g. Peanuts, Aspirin" className="w-full bg-red-50/50 text-sm font-bold text-red-500 p-3 rounded-xl border border-red-100 outline-none h-20 resize-none" /></div>
                      <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Chronic Conditions</label><textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleInputChange} placeholder="e.g. Asthma, Diabetes" className="w-full bg-purple-50/50 text-sm font-bold text-purple-600 p-3 rounded-xl border border-purple-100 outline-none h-20 resize-none" /></div>
                   </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 transform active:scale-[0.98]">
                    <FaSave /> {loading ? "Saving Medical File..." : "Save Full Profile"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default PatientProfile;