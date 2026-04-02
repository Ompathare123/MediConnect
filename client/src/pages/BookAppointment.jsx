import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBars, FaTachometerAlt, FaCalendarPlus, FaCalendarCheck,
  FaFilePrescription, FaUser, FaSignOutAlt, FaBell,
  FaHospitalUser, FaChevronLeft, FaPaperclip, FaInfoCircle
} from "react-icons/fa";

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  
  // --- SYNC SIDEBAR STATE WITH LOCALSTORAGE ---
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [successMessage, setSuccessMessage] = useState(false);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotFee, setSelectedSlotFee] = useState(0);

  const userName = localStorage.getItem("userName") || "Patient";

  const [formData, setFormData] = useState({ 
    patientName: userName, 
    age: '', 
    bloodGroup: '', 
    department: '', 
    doctorId: '', 
    appointmentDate: '', 
    timeSlot: '', 
    consultationMode: 'in-person', 
    symptoms: '', 
    medicalReports: null 
  });
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Persistence effect for sidebar
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/patient-dashboard" },
    { icon: FaCalendarPlus, label: "Book Appointment", active: true, path: "/book-appointment" },
    { icon: FaCalendarCheck, label: "My Appointments", path: "/appointments" },
    { icon: FaFilePrescription, label: "Prescriptions", path: "/prescriptions" },
    { icon: FaUser, label: "Profile", path: "/profile" }
  ];

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.department) {
        setDbDoctors([]);
        return;
      }
      setLoadingDoctors(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/doctors/all`, {
          params: { department: formData.department }
        });
        setDbDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDbDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
    setFormData(prev => ({ ...prev, doctorId: '', timeSlot: '' }));
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlotFee(0);
  }, [formData.department]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate || formData.doctorId === "null") {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/schedule/get`, {
          params: { 
            doctorId: formData.doctorId, 
            date: formData.appointmentDate 
          }
        });
        setAvailableSlots(response.data);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
    setFormData(prev => ({ ...prev, timeSlot: '' }));
    setSelectedSlotFee(0);
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    if (formData.doctorId && formData.doctorId !== "null") {
      const doctor = dbDoctors.find(doc => doc._id === formData.doctorId);
      setSelectedDoctor(doctor || null);
    } else { 
      setSelectedDoctor(null); 
    }
  }, [formData.doctorId, dbDoctors]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "medicalReports") {
      setFormData(prev => ({ ...prev, medicalReports: files[0] }));
    } else if (name === "timeSlot") {
      const slotObj = availableSlots.find(s => s.time === value);
      setSelectedSlotFee(slotObj ? slotObj.fee : 0);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!formData.doctorId || formData.doctorId === "null") {
        return alert("Please select a valid doctor.");
    }
    
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("patientName", formData.patientName);
      data.append("doctorId", formData.doctorId);
      data.append("doctorName", selectedDoctor?.name || "");
      data.append("department", formData.department);
      data.append("appointmentDate", formData.appointmentDate);
      data.append("timeSlot", formData.timeSlot);
      data.append("age", formData.age);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("symptoms", formData.symptoms);
      
      if (formData.medicalReports) {
        data.append("medicalReport", formData.medicalReports);
      }

      const res = await axios.post("http://localhost:5000/api/appointments", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      if (res.status === 201 || res.data.success) { 
        setSuccessMessage(true); 
        setTimeout(() => navigate("/patient-dashboard"), 2000); 
      }
    } catch (error) { 
      const errorMsg = error.response?.data?.message || "Server error while booking.";
      alert(errorMsg); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-left">
      {/* Sidebar - Controlled strictly by isCollapsed state */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-2xl transition-all duration-300 ease-in-out flex flex-col z-50 sticky top-0 h-screen`}>
        
        <div className={`h-20 px-6 border-b border-blue-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold flex items-center space-x-3 italic whitespace-nowrap overflow-hidden">
              <FaHospitalUser /> {/* Icon added before MediConnect */}
              <span>MediConnect</span>
            </h2>
          )}
          {/* ONLY this toggle button handles minimize/expand */}
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
            <button key={index} 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
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
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all duration-200`}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="flex-shrink-0"><FaSignOutAlt size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 px-8 flex justify-between items-center shrink-0 z-40">
          <h1 className="text-2xl font-bold text-blue-700">Book Appointment</h1>
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div 
               className="flex items-center space-x-3 border-l pl-6 border-gray-100 text-right cursor-pointer"
               onClick={() => navigate("/profile")}
            >
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`} alt="profile" className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                <p className="text-[11px] text-gray-400 mt-1 uppercase font-semibold">Verified Patient</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <main className="p-8 max-w-7xl mx-auto w-full relative">
            <div className="mb-8 text-left">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Book Appointment</h2>
              <p className="text-slate-500 font-medium">Schedule your consultation with a specialist</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8 text-left">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Appointment Details</h3>
                  <form onSubmit={handleBookAppointment} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</label>
                        <input type="text" value={userName} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium" readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department *</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" required>
                          <option value="">Select Department</option>
                          <option value="General Checkup">General Checkup</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Age *</label>
                        <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" placeholder="Enter age" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Blood Group *</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" required>
                          <option value="">Select Group</option>
                          <option>A+</option><option>A-</option>
                          <option>B+</option><option>B-</option>
                          <option>O+</option><option>O-</option>
                          <option>AB+</option><option>AB-</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Doctor *</label>
                        <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" required disabled={!formData.department || loadingDoctors}>
                          <option value="">{loadingDoctors ? "Loading Doctors..." : "Choose Doctor"}</option>
                          {dbDoctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date *</label>
                          <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Time *</label>
                          <select 
                            name="timeSlot" 
                            value={formData.timeSlot} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            required 
                            disabled={!formData.appointmentDate || loadingSlots}
                          >
                            <option value="">{loadingSlots ? "Loading..." : "Time"}</option>
                            {availableSlots.length > 0 ? (
                                availableSlots.map((slot, index) => (
                                    <option 
                                      key={index} 
                                      value={slot.time}
                                      disabled={slot.isFull} 
                                    >
                                      {slot.time} {slot.isFull ? "(Full)" : ""}
                                    </option>
                                ))
                            ) : (
                                formData.appointmentDate && !loadingSlots && <option disabled>No Slots Available</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Symptoms / Description</label>
                      <textarea name="symptoms" rows="4" value={formData.symptoms} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium transition-all" placeholder="Please describe your symptoms..."></textarea>
                    </div>

                    <div onClick={handleUploadClick} className="border-2 border-dashed border-blue-100 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        name="medicalReports" 
                        ref={fileInputRef} 
                        onChange={handleInputChange} 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <FaPaperclip className="mx-auto text-blue-400 text-2xl mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-gray-700">
                        {formData.medicalReports ? formData.medicalReports.name : "Upload Medical Reports"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 uppercase">PDF, JPG, PNG (Max 10MB)</p>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all">Confirm Booking</button>
                      <button type="reset" onClick={() => {setFormData({...formData, symptoms: '', department: '', doctorId: '', age: '', bloodGroup: '', appointmentDate: '', timeSlot: '', medicalReports: null}); setSelectedDoctor(null); setAvailableSlots([]); setSelectedSlotFee(0);}} className="px-8 py-4 border-2 border-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-white hover:text-gray-600 transition-all">Reset</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-4 sticky top-0 space-y-6 pb-8 text-left">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-8 text-center relative overflow-hidden">
                  {selectedDoctor ? (
                    <>
                      <img src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${selectedDoctor.name}&background=0D8ABC&color=fff`} alt={selectedDoctor.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50 object-cover shadow-md" />
                      <h4 className="text-xl font-bold text-gray-800">{selectedDoctor.name}</h4>
                      <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-widest">{selectedDoctor.department}</p>
                      <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 mb-6 text-sm text-left">
                        <div className="shrink-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Experience</p><p className="font-black text-gray-700 whitespace-nowrap">{selectedDoctor.experience} Years</p></div>
                        {selectedDoctor.fees > 0 && (
                          <div className="text-right shrink-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fee</p><p className="font-black text-gray-700">₹{selectedDoctor.fees}</p></div>
                        )}
                      </div>
                      <div className="text-left mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center space-x-2 text-blue-700 font-bold text-[10px] uppercase mb-2">
                          <FaInfoCircle /> <span>Professional Bio</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed italic">"{selectedDoctor.bio || 'Specialist in the field.'}"</p>
                      </div>
                      <div className="bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center font-black">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>Available Today
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center"><FaHospitalUser className="mx-auto text-blue-100 text-6xl mb-4" /><p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Select doctor for details</p></div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-50 p-8 relative overflow-hidden text-left">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6 border-b border-gray-50 pb-4">Payment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Consultation Fee</span>
                      <span className="text-slate-800 font-black">₹{selectedSlotFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-slate-800">₹{selectedSlotFee}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-10 right-10 z-[100] bg-white border-l-4 border-green-500 shadow-2xl p-6 rounded-lg flex items-center space-x-4 animate-bounce">
          <div className="bg-green-100 p-2 rounded-full text-green-600 font-bold">✅</div>
          <div className="text-left"><p className="font-bold text-gray-800 leading-none">Success!</p><p className="text-xs text-gray-500 mt-1">Booking confirmed.</p></div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default BookAppointmentPage;