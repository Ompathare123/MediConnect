import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const pageMarkup = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Poppins',var(--font-sans),sans-serif;background:#fff;color:#1a2d40;overflow-x:hidden}
  a{text-decoration:none;color:inherit}
  .nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:1rem 2.5rem;border-bottom:.5px solid #e0edf5;position:sticky;top:0;background:rgba(255,255,255,0.97);backdrop-filter:blur(8px);z-index:100}
  .logo{font-size:1.4rem;font-weight:700;color:#0a7ea4;letter-spacing:-0.5px;display:flex;align-items:center;gap:8px}
  .logo-icon{width:32px;height:32px;background:linear-gradient(135deg,#0a7ea4,#22c55e);border-radius:8px;display:flex;align-items:center;justify-content:center}
  .logo-icon svg{width:18px;height:18px;fill:#fff}
  .nav-links{display:flex;gap:2rem;list-style:none}
  .nav-links a{font-size:.9rem;font-weight:500;color:#4a6680;transition:color .2s}
  .nav-links a:hover{color:#0a7ea4}
  .nav-right{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}
  .btn-login{padding:.5rem 1.1rem;border-radius:8px;font-size:.875rem;font-weight:500;color:#0a7ea4;border:.5px solid #0a7ea4;cursor:pointer;transition:all .2s;background:transparent}
  .btn-login:hover{background:#e8f4fa}
  .btn-signup{padding:.5rem 1.2rem;border-radius:8px;font-size:.875rem;font-weight:500;color:#fff;background:#0a7ea4;border:none;cursor:pointer;transition:all .2s}
  .btn-signup:hover{background:#0869891;transform:translateY(-1px)}
  .hero{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center;padding:5rem 2.5rem 4rem;background:linear-gradient(135deg,#f0f9ff 0%,#f0fdf4 100%);min-height:88vh}
  .hero-text h1{font-size:3.2rem;font-weight:700;line-height:1.15;color:#0f2b3d;margin-bottom:1.25rem}
  .hero-text h1 span{color:#0a7ea4}
  .hero-text p{font-size:1.05rem;color:#5a7a90;line-height:1.8;margin-bottom:2rem;max-width:480px}
  .hero-btns{display:flex;gap:1rem;flex-wrap:wrap}
  .btn-primary{padding:.85rem 1.75rem;border-radius:12px;font-size:.95rem;font-weight:600;color:#fff;background:#0a7ea4;border:none;cursor:pointer;transition:all .25s;box-shadow:0 4px 14px rgba(10,126,164,0.25)}
  .btn-primary:hover{background:#0869891;transform:translateY(-2px);box-shadow:0 6px 20px rgba(10,126,164,0.35)}
  .btn-outline{padding:.85rem 1.75rem;border-radius:12px;font-size:.95rem;font-weight:600;color:#0a7ea4;background:transparent;border:1.5px solid #0a7ea4;cursor:pointer;transition:all .25s}
  .btn-outline:hover{background:#e8f4fa;transform:translateY(-2px)}
  .hero-visual{display:flex;justify-content:center;align-items:center}
  .hero-illustration{width:100%;max-width:520px;border-radius:24px;overflow:hidden}
  .stats-bar{display:flex;gap:2rem;margin-top:2.5rem;flex-wrap:wrap}
  .stat{text-align:center}
  .stat-num{font-size:1.6rem;font-weight:700;color:#0a7ea4}
  .stat-label{font-size:.78rem;color:#7a9ab0;font-weight:500;margin-top:2px}
  .section{padding:5rem 2.5rem}
  .section-title{text-align:center;margin-bottom:.75rem;font-size:2rem;font-weight:700;color:#0f2b3d}
  .section-sub{text-align:center;color:#7a9ab0;font-size:1rem;margin-bottom:3.5rem;max-width:540px;margin-left:auto;margin-right:auto;line-height:1.7}
  .features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
  .feature-card{background:#fff;border:.5px solid #e0edf5;border-radius:20px;padding:2rem 1.5rem;text-align:center;transition:all .25s;cursor:default}
  .feature-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(10,126,164,0.1);border-color:#b0d8ed}
  .feat-icon{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}
  .feat-icon svg{width:28px;height:28px}
  .feat-blue{background:#e8f4fa}
  .feat-green{background:#f0fdf4}
  .feat-purple{background:#f3f0ff}
  .feat-amber{background:#fffbeb}
  .feature-card h3{font-size:1rem;font-weight:600;color:#0f2b3d;margin-bottom:.6rem}
  .feature-card p{font-size:.85rem;color:#7a9ab0;line-height:1.65}
  .about{background:linear-gradient(135deg,#f0f9ff,#f0fdf4);border-radius:28px;margin:0 2.5rem;padding:4.5rem 3.5rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
  .about-text h2{font-size:2rem;font-weight:700;color:#0f2b3d;margin-bottom:1.25rem}
  .about-text p{font-size:.95rem;color:#5a7a90;line-height:1.85;margin-bottom:1rem}
  .about-pills{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.5rem}
  .pill{padding:.4rem 1rem;border-radius:20px;font-size:.8rem;font-weight:600;background:#e8f4fa;color:#0a7ea4}
  .about-visual{display:flex;justify-content:center}
  .docs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.75rem}
  .doc-card{background:#fff;border:.5px solid #e0edf5;border-radius:20px;overflow:hidden;transition:all .25s}
  .doc-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,0.08);border-color:#b0d8ed}
  .doc-avatar{width:100%;height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
  .doc-info{padding:1.5rem}
  .doc-info h3{font-size:1.05rem;font-weight:600;color:#0f2b3d;margin-bottom:.25rem}
  .doc-info .spec{font-size:.82rem;color:#0a7ea4;font-weight:500;margin-bottom:1rem}
  .btn-profile{width:100%;padding:.65rem;border-radius:10px;font-size:.85rem;font-weight:600;color:#0a7ea4;background:#e8f4fa;border:none;cursor:pointer;transition:all .2s}
  .btn-profile:hover{background:#0a7ea4;color:#fff}
  .cta{background:linear-gradient(135deg,#0a7ea4,#0f5e7a);border-radius:28px;margin:0 2.5rem;padding:5rem 3rem;text-align:center}
  .cta h2{font-size:2.2rem;font-weight:700;color:#fff;margin-bottom:1rem}
  .cta p{color:rgba(255,255,255,0.8);font-size:1.05rem;margin-bottom:2rem}
  .btn-cta{padding:.95rem 2.5rem;border-radius:12px;font-size:1rem;font-weight:600;color:#0a7ea4;background:#fff;border:none;cursor:pointer;transition:all .25s;box-shadow:0 4px 14px rgba(0,0,0,0.15)}
  .btn-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2)}
  .footer{background:#f8fafc;border-top:.5px solid #e0edf5;padding:3.5rem 2.5rem 2rem}
  .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:2.5rem;margin-bottom:2.5rem}
  .footer-brand p{font-size:.87rem;color:#7a9ab0;line-height:1.75;margin-top:.75rem;max-width:260px}
  .footer-col h4{font-size:.9rem;font-weight:600;color:#0f2b3d;margin-bottom:1rem}
  .footer-col ul{list-style:none}
  .footer-col li{margin-bottom:.6rem}
  .footer-col a{font-size:.85rem;color:#7a9ab0;transition:color .2s}
  .footer-col a:hover{color:#0a7ea4}
  .footer-contact p{font-size:.85rem;color:#7a9ab0;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem}
  .social-row{display:flex;gap:.75rem;margin-top:.75rem}
  .social-btn{width:36px;height:36px;border-radius:8px;background:#e8f4fa;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
  .social-btn:hover{background:#0a7ea4}
  .social-btn:hover svg{fill:#fff}
  .social-btn svg{width:16px;height:16px;fill:#0a7ea4;transition:fill .2s}
  .footer-bottom{border-top:.5px solid #e0edf5;padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center}
  .footer-bottom p{font-size:.8rem;color:#a0b4c0}
  .badge{display:inline-flex;align-items:center;gap:.4rem;background:#e8f4fa;color:#0a7ea4;border-radius:20px;padding:.35rem .9rem;font-size:.8rem;font-weight:600;margin-bottom:1.25rem}
  .badge svg{width:14px;height:14px;fill:#0a7ea4}
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  .fadein{animation:fadeUp .6s ease both}
  .fadein-1{animation-delay:.1s}.fadein-2{animation-delay:.2s}.fadein-3{animation-delay:.3s}.fadein-4{animation-delay:.4s}
  @media(max-width:900px){
    .hero{grid-template-columns:1fr;text-align:center;padding:3rem 1.5rem}
    .hero-text p{margin:0 auto 2rem}
    .hero-btns{justify-content:center}
    .hero-visual{margin-top:1rem}
    .stats-bar{justify-content:center}
    .features-grid{grid-template-columns:repeat(2,1fr)}
    .about{grid-template-columns:1fr;margin:0 1.5rem;padding:3rem 2rem}
    .docs-grid{grid-template-columns:1fr}
    .footer-grid{grid-template-columns:1fr 1fr}
    .nav-links{display:none}
    .nav{padding:.9rem 1.2rem}
    .logo{font-size:1.2rem}
    .btn-login,.btn-signup{padding:.46rem .9rem;font-size:.8rem}
    .cta{margin:0 1.5rem}
    .section{padding:4rem 1.5rem}
  }
  @media(max-width:540px){
    .features-grid{grid-template-columns:1fr}
    .footer-grid{grid-template-columns:1fr}
    .hero-text h1{font-size:2.2rem}
    .hero{padding:2.2rem 1rem;min-height:auto}
    .hero-text p{font-size:.95rem;line-height:1.65}
    .hero-btns{flex-direction:column;align-items:stretch}
    .btn-primary,.btn-outline,.btn-cta{width:100%}
    .stats-bar{gap:1rem;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:1.5rem}
    .stat-num{font-size:1.2rem}
    .stat-label{font-size:.72rem}
    .about{margin:0 1rem;padding:2rem 1rem}
    .cta{margin:0 1rem;padding:2.5rem 1rem}
    .cta h2{font-size:1.55rem}
    .section{padding:3rem 1rem}
    .footer{padding:2.5rem 1rem 1.5rem}
    .footer-bottom{flex-direction:column;gap:.45rem;text-align:center}
    .nav{padding:.8rem .9rem;align-items:flex-start}
    .logo{font-size:1.05rem}
    .logo-icon{width:28px;height:28px}
    .logo-icon svg{width:14px;height:14px}
    .nav-right{gap:.45rem;width:100%;justify-content:flex-end}
    .btn-login,.btn-signup{padding:.42rem .7rem;font-size:.74rem;border-radius:7px}
  }
</style>

<nav class="nav">
  <div class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
    </div>
    MediConnect
  </div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#doctors">Doctors</a></li>
    <li><a href="#cta">Appointments</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <div class="nav-right">
    <button class="btn-login">Login</button>
    <button class="btn-signup">Sign Up</button>
  </div>
</nav>

<section class="hero">
  <div class="hero-text fadein fadein-1">
    <div class="badge">
      <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Trusted by 50,000+ patients
    </div>
    <h1>Your Health,<br><span>Our Priority</span></h1>
    <p>Book appointments, manage prescriptions, and connect with trusted doctors anytime, anywhere — all in one seamless platform.</p>
    <div class="hero-btns">
      <button class="btn-primary">Book Appointment</button>
      <button class="btn-outline">Learn More</button>
    </div>
    <div class="stats-bar">
      <div class="stat"><div class="stat-num">500+</div><div class="stat-label">Expert Doctors</div></div>
      <div class="stat"><div class="stat-num">50K+</div><div class="stat-label">Happy Patients</div></div>
      <div class="stat"><div class="stat-num">98%</div><div class="stat-label">Satisfaction Rate</div></div>
    </div>
  </div>
  <div class="hero-visual fadein fadein-2">
    <svg class="hero-illustration" viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#dcfce7"/>
        </linearGradient>
        <linearGradient id="doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a7ea4"/>
          <stop offset="100%" stop-color="#0f5e7a"/>
        </linearGradient>
      </defs>
      <rect width="520" height="420" rx="24" fill="url(#bg)"/>
      <circle cx="260" cy="180" r="110" fill="#fff" opacity=".6"/>
      <rect x="210" y="100" width="100" height="30" rx="8" fill="url(#doc)"/>
      <rect x="230" y="95" width="60" height="40" rx="4" fill="#fff" opacity=".15"/>
      <circle cx="260" cy="145" r="36" fill="url(#doc)"/>
      <circle cx="260" cy="135" r="18" fill="#b0d8ed"/>
      <rect x="248" y="149" width="24" height="32" rx="6" fill="#fff" opacity=".9"/>
      <rect x="252" y="155" width="16" height="10" rx="2" fill="#b0d8ed"/>
      <rect x="248" y="168" width="10" height="13" rx="3" fill="#b0d8ed"/>
      <rect x="262" y="168" width="10" height="13" rx="3" fill="#b0d8ed"/>
      <rect x="60" y="140" width="120" height="90" rx="16" fill="#fff" opacity=".9"/>
      <circle cx="100" cy="168" r="18" fill="#bae6fd"/>
      <circle cx="100" cy="160" r="9" fill="#7dd3fc"/>
      <rect x="92" y="176" width="16" height="20" rx="4" fill="#e0f2fe"/>
      <text x="125" y="162" font-family="Poppins,sans-serif" font-size="9" fill="#0f2b3d" font-weight="600">Sarah K.</text>
      <text x="125" y="176" font-family="Poppins,sans-serif" font-size="8" fill="#0a7ea4">Patient</text>
      <rect x="72" y="200" width="95" height="6" rx="3" fill="#e0edf5"/>
      <rect x="72" y="212" width="70" height="6" rx="3" fill="#e0edf5"/>
      <rect x="330" y="140" width="130" height="90" rx="16" fill="#fff" opacity=".9"/>
      <rect x="345" y="158" width="20" height="20" rx="4" fill="#dcfce7"/>
      <text x="348" y="172" font-family="Poppins,sans-serif" font-size="12" fill="#22c55e">+</text>
      <text x="372" y="168" font-family="Poppins,sans-serif" font-size="9" fill="#0f2b3d" font-weight="600">Appointment</text>
      <text x="372" y="180" font-family="Poppins,sans-serif" font-size="8" fill="#22c55e">Confirmed</text>
      <rect x="345" y="196" width="100" height="6" rx="3" fill="#e0edf5"/>
      <rect x="345" y="208" width="75" height="6" rx="3" fill="#e0edf5"/>
      <rect x="150" y="265" width="220" height="100" rx="20" fill="#fff" opacity=".95"/>
      <circle cx="190" cy="295" r="20" fill="#f0fdf4"/>
      <circle cx="190" cy="288" r="10" fill="#86efac"/>
      <rect x="183" y="298" width="14" height="18" rx="4" fill="#dcfce7"/>
      <text x="218" y="290" font-family="Poppins,sans-serif" font-size="10" fill="#0f2b3d" font-weight="600">Dr. Emily Chen</text>
      <text x="218" y="304" font-family="Poppins,sans-serif" font-size="8.5" fill="#0a7ea4">Cardiologist · 4.9 ★</text>
      <rect x="175" y="326" width="170" height="26" rx="8" fill="#0a7ea4"/>
      <text x="260" y="343" font-family="Poppins,sans-serif" font-size="9" fill="#fff" font-weight="600" text-anchor="middle">Book Appointment</text>
    </svg>
  </div>
</section>

<section id="services" class="section" style="background:#fff">
  <div class="section-title fadein">Everything you need in one place</div>
  <div class="section-sub fadein fadein-1">Comprehensive healthcare tools designed to make managing your health simple, fast, and accessible.</div>
  <div class="features-grid">
    <div class="feature-card fadein fadein-1">
      <div class="feat-icon feat-blue">
        <svg viewBox="0 0 24 24" fill="#0a7ea4"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
      </div>
      <h3>Online Appointment Booking</h3>
      <p>Schedule visits with top doctors in seconds. Real-time availability, instant confirmations, and smart reminders.</p>
    </div>
    <div class="feature-card fadein fadein-2">
      <div class="feat-icon feat-green">
        <svg viewBox="0 0 24 24" fill="#22c55e"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
      </div>
      <h3>Digital Prescriptions</h3>
      <p>Receive, store, and share prescriptions digitally. No more lost papers — your medications, always at hand.</p>
    </div>
    <div class="feature-card fadein fadein-3">
      <div class="feat-icon feat-purple">
        <svg viewBox="0 0 24 24" fill="#7c3aed"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      </div>
      <h3>Doctor Consultation</h3>
      <p>Connect with certified specialists via video, chat, or in-person. Expert guidance whenever you need it.</p>
    </div>
    <div class="feature-card fadein fadein-4">
      <div class="feat-icon feat-amber">
        <svg viewBox="0 0 24 24" fill="#d97706"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
      </div>
      <h3>Patient Records Management</h3>
      <p>Securely store and access your full medical history, test results, and health data — all in one private vault.</p>
    </div>
  </div>
</section>

<div id="about" class="about fadein">
  <div class="about-text">
    <div class="badge">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      About MediConnect
    </div>
    <h2>Bridging the gap between patients and care</h2>
    <p>MediConnect was founded on a simple belief: quality healthcare should be accessible to everyone, not just those who can navigate complex systems. We've built a platform that removes the friction between patients and the care they need.</p>
    <p>From rural communities to busy city dwellers, our technology ensures that booking a doctor, managing medications, or accessing your health records is always just a few taps away.</p>
    <div class="about-pills">
      <span class="pill">HIPAA Compliant</span>
      <span class="pill">256-bit Encryption</span>
      <span class="pill">24/7 Support</span>
      <span class="pill">ISO Certified</span>
    </div>
  </div>
  <div class="about-visual">
    <svg viewBox="0 0 340 280" width="340" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="280" rx="20" fill="#fff" opacity=".7"/>
      <rect x="20" y="20" width="300" height="240" rx="16" fill="#f0f9ff"/>
      <rect x="40" y="40" width="120" height="80" rx="12" fill="#fff"/>
      <circle cx="80" cy="65" r="16" fill="#bae6fd"/>
      <circle cx="80" cy="58" r="8" fill="#7dd3fc"/>
      <rect x="74" y="73" width="12" height="18" rx="3" fill="#e0f2fe"/>
      <text x="104" y="63" font-family="Poppins,sans-serif" font-size="8.5" fill="#0f2b3d" font-weight="600">Active Users</text>
      <text x="104" y="78" font-family="Poppins,sans-serif" font-size="14" fill="#0a7ea4" font-weight="700">50,412</text>
      <text x="104" y="92" font-family="Poppins,sans-serif" font-size="7.5" fill="#22c55e">↑ 12% this month</text>
      <rect x="180" y="40" width="140" height="80" rx="12" fill="#fff"/>
      <rect x="195" y="58" width="18" height="18" rx="4" fill="#dcfce7"/>
      <text x="198" y="71" font-family="Poppins,sans-serif" font-size="12" fill="#22c55e">✓</text>
      <text x="222" y="65" font-family="Poppins,sans-serif" font-size="8.5" fill="#0f2b3d" font-weight="600">Appointments</text>
      <text x="222" y="78" font-family="Poppins,sans-serif" font-size="13" fill="#0a7ea4" font-weight="700">1,284</text>
      <text x="222" y="92" font-family="Poppins,sans-serif" font-size="7.5" fill="#22c55e">Today</text>
      <rect x="40" y="140" width="280" height="100" rx="12" fill="#fff"/>
      <text x="60" y="162" font-family="Poppins,sans-serif" font-size="9" fill="#7a9ab0" font-weight="600">Patient Satisfaction Trend</text>
      <polyline points="60,220 90,200 120,208 150,190 180,182 210,172 240,165 270,155 300,148" fill="none" stroke="#0a7ea4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="300" cy="148" r="5" fill="#0a7ea4"/>
      <circle cx="300" cy="148" r="3" fill="#fff"/>
    </svg>
  </div>
</div>

<section id="doctors" class="section" style="background:#f8fafc">
  <div class="section-title fadein">Meet Our Specialists</div>
  <div class="section-sub fadein fadein-1">Board-certified doctors across all specializations, ready to provide you with expert care.</div>
  <div class="docs-grid">
    <div class="doc-card fadein fadein-1">
      <div class="doc-avatar" style="background:linear-gradient(135deg,#e0f2fe,#bae6fd)">
        <svg viewBox="0 0 100 130" width="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="42" r="28" fill="#7dd3fc"/><circle cx="50" cy="34" r="16" fill="#bae6fd"/><rect x="30" y="68" width="40" height="60" rx="10" fill="#0a7ea4"/><rect x="42" y="62" width="16" height="20" rx="4" fill="#e0f2fe"/><rect x="44" y="56" width="12" height="8" rx="2" fill="#bae6fd"/></svg>
      </div>
      <div class="doc-info"><h3>Dr. Emily Chen</h3><div class="spec">Cardiologist · ★ 4.9</div><button class="btn-profile">View Profile</button></div>
    </div>
    <div class="doc-card fadein fadein-2">
      <div class="doc-avatar" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7)">
        <svg viewBox="0 0 100 130" width="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="42" r="28" fill="#86efac"/><circle cx="50" cy="34" r="16" fill="#dcfce7"/><rect x="30" y="68" width="40" height="60" rx="10" fill="#22c55e"/><rect x="42" y="62" width="16" height="20" rx="4" fill="#f0fdf4"/><rect x="44" y="56" width="12" height="8" rx="2" fill="#86efac"/></svg>
      </div>
      <div class="doc-info"><h3>Dr. Marcus Rivera</h3><div class="spec">Neurologist · ★ 4.8</div><button class="btn-profile">View Profile</button></div>
    </div>
    <div class="doc-card fadein fadein-3">
      <div class="doc-avatar" style="background:linear-gradient(135deg,#f3f0ff,#ede9fe)">
        <svg viewBox="0 0 100 130" width="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="42" r="28" fill="#c4b5fd"/><circle cx="50" cy="34" r="16" fill="#ede9fe"/><rect x="30" y="68" width="40" height="60" rx="10" fill="#7c3aed"/><rect x="42" y="62" width="16" height="20" rx="4" fill="#f3f0ff"/><rect x="44" y="56" width="12" height="8" rx="2" fill="#c4b5fd"/></svg>
      </div>
      <div class="doc-info"><h3>Dr. Aisha Patel</h3><div class="spec">Pediatrician · ★ 5.0</div><button class="btn-profile">View Profile</button></div>
    </div>
  </div>
</section>

<div id="cta" class="cta fadein" style="margin-bottom:0">
  <h2>Take the first step towards better health today</h2>
  <p>Join over 50,000 patients who trust MediConnect for their healthcare journey. Get started for free.</p>
  <button class="btn-cta">Get Started - It's Free</button>
</div>

<footer id="contact" class="footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="logo" style="font-size:1.2rem">
        <div class="logo-icon" style="width:28px;height:28px">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
        </div>
        MediConnect
      </div>
      <p>Your trusted digital health companion. Connecting patients with world-class medical professionals, always.</p>
      <div class="social-row">
        <div class="social-btn"><svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></div>
        <div class="social-btn"><svg viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg></div>
        <div class="social-btn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg></div>
      </div>
    </div>
    <div class="footer-col"><h4>Company</h4><ul><li><a href="#about">About Us</a></li><li><a href="#doctors">Our Team</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li></ul></div>
    <div class="footer-col"><h4>Legal</h4><ul><li><a href="#services">Services</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Use</a></li><li><a href="#">Cookie Policy</a></li></ul></div>
    <div class="footer-col footer-contact">
      <h4>Contact</h4>
      <p>123 Health Ave, Mumbai, MH</p>
      <p>+91 98765 43210</p>
      <p>hello@mediconnect.in</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 MediConnect. All rights reserved.</p>
    <p>Made with care for better health outcomes.</p>
  </div>
</footer>
`;

const Welcome = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/doctors/public");
        if (!response.ok) return;
        const data = await response.json();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Public doctors fetch error:", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const bindClick = (selector, handler) => {
      const nodes = root.querySelectorAll(selector);
      nodes.forEach((node) => node.addEventListener("click", handler));
      return () => nodes.forEach((node) => node.removeEventListener("click", handler));
    };

    const goLogin = (e) => {
      e.preventDefault();
      navigate("/login");
    };

    const goRegister = (e) => {
      e.preventDefault();
      navigate("/register");
    };

    const learnMore = (e) => {
      e.preventDefault();
      const about = root.querySelector("#about");
      if (about) about.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const cleanups = [
      bindClick(".btn-login", goLogin),
      bindClick(".btn-signup", goRegister),
      bindClick(".btn-primary", goLogin),
      bindClick(".btn-cta", goRegister),
      bindClick(".btn-outline", learnMore)
    ];

    const docsGrid = root.querySelector(".docs-grid");
    if (docsGrid && doctors.length > 0) {
      const gradients = [
        "linear-gradient(135deg,#e0f2fe,#bae6fd)",
        "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        "linear-gradient(135deg,#f3f0ff,#ede9fe)"
      ];

      const topDoctors = doctors.slice(0, 3);
      docsGrid.innerHTML = topDoctors
        .map((doc, idx) => {
          const name = (doc.name || "Doctor").replace(/[<>]/g, "");
          const spec = (doc.specialization || doc.department || "Specialist").replace(/[<>]/g, "");
          const bg = gradients[idx % gradients.length];
          const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a7ea4&color=fff&size=256`;

          return `
            <div class="doc-card fadein fadein-${(idx % 4) + 1}">
              <div class="doc-avatar" style="background:${bg}">
                <img src="${avatar}" alt="${name}" style="width:92px;height:92px;border-radius:9999px;border:4px solid #ffffff;object-fit:cover;" />
              </div>
              <div class="doc-info">
                <h3>${name}</h3>
                <div class="spec">${spec}</div>
                <button class="btn-profile">View Profile</button>
              </div>
            </div>
          `;
        })
        .join("");
    }

    const profileButtons = root.querySelectorAll(".btn-profile");
    profileButtons.forEach((btn) => btn.addEventListener("click", goLogin));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      profileButtons.forEach((btn) => btn.removeEventListener("click", goLogin));
    };
  }, [navigate, doctors]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
};

export default Welcome;
