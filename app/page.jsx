"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Leaf, Truck, Smartphone, 
  ShieldCheck, Database, Users, Camera, Activity, 
  Heart, ArrowRight, CheckCircle, MapPin, Gift 
} from 'lucide-react';

const GreenChainLanding = () => {
  const router = useRouter();

  return (
    <div className="font-sans text-gray-800 bg-gray-50 overflow-x-hidden selection:bg-[#0F766E] selection:text-white">
      {/* Inject Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* --- Hero Section --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#D1FAE5] rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse"></div>
        <div className="absolute top-40 left-0 -ml-20 w-72 h-72 bg-yellow-100 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Hero Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D1FAE5] text-[#0F766E] text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Connecting Food to People
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#1F2937] mb-6">
                Redistribute Food. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-500">Reduce Waste.</span> <br/>
                Build Impact.
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                GreenChain connects donors, receivers, and volunteers to ensure surplus food reaches those who need it—ensuring transparency and trust every step of the way.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  type="button"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F766E] text-white rounded-full font-semibold shadow-lg shadow-teal-700/20 hover:shadow-teal-700/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  onClick={() => router.push('/register')}
                >
                  Get Started <ChevronRight size={20} />
                </button>
                <button 
                  type="button"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#1F2937] border border-gray-200 rounded-full font-semibold hover:border-[#0F766E] hover:text-[#0F766E] transition-all flex items-center justify-center gap-2"
                  onClick={() => router.push('/login')}
                >
                  <Activity size={20} /> How It Works
                </button>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="lg:w-1/2 w-full flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Abstract composition representing connection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D1FAE5] to-white rounded-[2rem] shadow-2xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white shadow-xl transform -rotate-2 flex flex-col items-center justify-center p-8">
                   
                   {/* Flow Diagram */}
                   <div className="grid grid-cols-3 gap-4 w-full h-full items-center">
                      {/* Donor */}
                      <div className="flex flex-col items-center gap-2 animate-bounce-slow">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                          <Gift size={32} />
                        </div>
                        <span className="text-xs font-bold text-gray-500">Donor</span>
                      </div>

                      {/* Connection Lines */}
                      <div className="flex flex-col items-center justify-center gap-2">
                         <div className="h-0.5 w-full bg-gray-200 relative overflow-hidden">
                           <div className="absolute inset-0 bg-[#0F766E] w-1/2 animate-loading-bar"></div>
                         </div>
                         <div className="p-2 bg-[#0F766E] rounded-full text-white shadow-lg z-10">
                           <Leaf size={24} />
                         </div>
                         <div className="h-0.5 w-full bg-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#0F766E] w-1/2 animate-loading-bar" style={{animationDelay: '0.5s'}}></div>
                         </div>
                      </div>

                      {/* Receiver */}
                      <div className="flex flex-col items-center gap-2 animate-bounce-slow" style={{animationDelay: '1s'}}>
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <Heart size={32} />
                        </div>
                        <span className="text-xs font-bold text-gray-500">Receiver</span>
                      </div>
                   </div>

                   {/* Floating Card */}
                   <div className="absolute bottom-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 w-64 animate-float">
                      <div className="bg-green-100 p-2 rounded-full text-green-700">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Delivery Verified</p>
                        <p className="text-xs text-gray-500">Just now • 50 meals saved</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- How It Works --- */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Simple Steps to Big Impact</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our platform streamlines the entire process of food redistribution, making it easier than ever to fight waste and hunger simultaneously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 -z-10"></div>

            {[
              {
                icon: <Smartphone size={32} />,
                color: "bg-orange-50 text-orange-600",
                title: "1. Upload Surplus",
                desc: "Donors easily list surplus food via the app with photos and details."
              },
              {
                icon: <MapPin size={32} />,
                color: "bg-blue-50 text-blue-600",
                title: "2. Locate & Claim",
                desc: "Verified receivers connect with nearby donors and claim food instantly."
              },
              {
                icon: <Truck size={32} />,
                color: "bg-green-50 text-green-600",
                title: "3. Deliver & Track",
                desc: "Volunteers pick up and deliver, providing real-time tracking updates."
              }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border-4 border-white`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Key Features --- */}
      <section id="features" className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Engineered for Efficiency</h2>
              <p className="text-gray-500">
                GreenChain isn't just a database; it's a smart logistics platform designed to handle the time-sensitive nature of food recovery.
              </p>
            </div>
            <button className="hidden md:flex text-[#0F766E] font-semibold items-center gap-2 hover:gap-3 transition-all">
              View all features <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Activity />, title: "Real-time Donations", desc: "Live feed of available food nearby." },
              { icon: <ShieldCheck />, title: "Verified Receivers", desc: "Strict vetting process for NGOs." },
              { icon: <Database />, title: "Secure Cloud Storage", desc: "Data protection and reliability." },
              { icon: <Users />, title: "Community Powered", desc: "Volunteer network integration." },
              { icon: <Camera />, title: "Easy Photo Uploads", desc: "Snap and list in seconds." },
              { icon: <CheckCircle />, title: "Transparent Tracking", desc: "Know exactly where food goes." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#D1FAE5] transition-all duration-300 group">
                <div className="w-12 h-12 bg-[#F0FDFA] rounded-xl text-[#0F766E] flex items-center justify-center mb-6 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h4>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Transparency Highlight --- */}
      <section className="py-24 bg-[#1F2937] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0F766E] opacity-10 rounded-l-full transform translate-x-1/4"></div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-block px-3 py-1 bg-[#0F766E] rounded-lg text-xs font-bold tracking-wider uppercase mb-6">
                Blockchain Verified
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Built on Trust and Accountability</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                We believe in radical transparency. Every donation is logged on an immutable ledger, ensuring that donors know exactly when their contribution reached the table. A transparent audit trail builds confidence for everyone involved.
              </p>
              <ul className="space-y-4">
                {[
                  "Immutable donation records",
                  "Time-stamped delivery confirmation",
                  "End-to-end chain of custody"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-200">
                    <div className="w-6 h-6 rounded-full bg-[#0F766E] flex items-center justify-center text-xs">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 w-full">
              {/* Visual representation of Blockchain/Trust */}
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <span className="text-gray-500 font-mono text-sm">audit_log.json</span>
                </div>
                
                {/* Log Items */}
                <div className="space-y-4 font-mono text-sm">
                   <div className="flex gap-4 opacity-50">
                     <span className="text-gray-500">10:42 AM</span>
                     <span className="text-[#0F766E]">Hash: 8x92...b1</span>
                     <span className="text-gray-300">Request Initiated</span>
                   </div>
                   <div className="flex gap-4 opacity-75">
                     <span className="text-gray-500">10:45 AM</span>
                     <span className="text-[#0F766E]">Hash: 3a14...c9</span>
                     <span className="text-gray-300">Donor Confirmed</span>
                   </div>
                   <div className="flex gap-4 bg-gray-700/50 p-2 rounded border-l-2 border-[#FACC15]">
                     <span className="text-gray-400">11:15 AM</span>
                     <span className="text-[#FACC15]">Pending</span>
                     <span className="text-white">Volunteer En Route</span>
                   </div>
                   <div className="flex gap-4">
                     <span className="text-gray-500">...</span>
                   </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -right-4 -bottom-4 bg-[#D1FAE5] text-[#0F766E] px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                   <ShieldCheck size={20} />
                   100% Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section id="stats" className="py-20 bg-[#0F766E]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "1,200+", label: "Meals Saved" },
              { number: "300+", label: "Active Donors" },
              { number: "98%", label: "Delivery Success" },
              { number: "50+", label: "NGOs Connected" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
                <div className="text-4xl md:text-5xl font-bold text-[#FACC15] mb-2">{stat.number}</div>
                <div className="text-emerald-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Community Voices</h2>
            <div className="h-1 w-20 bg-[#FACC15] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                quote: "GreenChain made it incredibly easy for our restaurant to donate leftover supplies instead of throwing them away. The process is seamless.",
                author: "Sarah Jenkins",
                role: "Restaurant Owner",
                initials: "SJ",
                color: "bg-purple-100 text-purple-600"
              },
              { 
                quote: "As a volunteer, I love the real-time app notifications. I can pick up a donation on my way home from work and make a difference.",
                author: "David Chen",
                role: "Volunteer Driver",
                initials: "DC",
                color: "bg-blue-100 text-blue-600"
              },
              { 
                quote: "The reliability of food sources has improved drastically for our shelter since we started using this platform. It's a lifesaver.",
                author: "Maria Rodriquez",
                role: "Shelter Coordinator",
                initials: "MR",
                color: "bg-orange-100 text-orange-600"
              }
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl relative">
                <div className="text-[#0F766E] opacity-20 absolute top-6 right-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21L14.017 18C14.017 16.0548 15.5891 14.8872 17.0601 14.8872C18.2356 14.8872 18.8228 15.3082 18.8228 15.3082C18.8228 15.3082 18.9959 12.0163 17.5186 10.5367C16.3308 9.34966 14.5029 9.34966 14.5029 9.34966C14.5029 9.34966 14.3995 7.15939 16.4852 5.0718C18.4908 3.06497 22.1008 3.06497 22.1008 3.06497V8.51368C22.1008 8.51368 20.897 8.51368 20.2458 9.16545C19.7891 9.6223 19.8242 10.5309 19.8242 10.5309C19.8242 10.5309 21.9961 10.7425 21.9961 14.0456C21.9961 18.0094 18.2356 21 14.017 21ZM4.0166 21L4.0166 18C4.0166 16.0548 5.58914 14.8872 7.06008 14.8872C8.23555 14.8872 8.82283 15.3082 8.82283 15.3082C8.82283 15.3082 8.99594 12.0163 7.51863 10.5367C6.33075 9.34966 4.50288 9.34966 4.50288 9.34966C4.50288 9.34966 4.39947 7.15939 6.48518 5.0718C8.49078 3.06497 12.1008 3.06497 12.1008 3.06497V8.51368C12.1008 8.51368 10.897 8.51368 10.2458 9.16545C9.78913 9.6223 9.82416 10.5309 9.82416 10.5309C9.82416 10.5309 11.9961 10.7425 11.9961 14.0456C11.9961 18.0094 8.23555 21 4.0166 21Z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#1F2937]">{t.author}</h5>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Call To Action --- */}
      <section className="py-24 bg-[#D1FAE5] relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FACC15] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F766E] mb-6">Join the GreenChain Movement</h2>
          <p className="text-[#1F2937] text-lg max-w-2xl mx-auto mb-10">
            Whether you have surplus food, need assistance, or have time to deliver — there is a place for you in our ecosystem.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              type="button"
              className="w-full md:w-auto px-8 py-4 bg-[#0F766E] text-white rounded-xl font-bold hover:bg-[#0d645d] hover:-translate-y-1 transition-all shadow-lg"
              onClick={() => router.push('/register')}
            >
              Sign Up as Donor
            </button>
             <button 
               type="button"
               className="w-full md:w-auto px-8 py-4 bg-white text-[#0F766E] border-2 border-[#0F766E] rounded-xl font-bold hover:bg-gray-50 hover:-translate-y-1 transition-all"
               onClick={() => router.push('/register')}
             >
              Sign Up as Receiver
            </button>
             <button 
               type="button"
               className="w-full md:w-auto px-8 py-4 bg-[#FACC15] text-gray-900 rounded-xl font-bold hover:bg-yellow-300 hover:-translate-y-1 transition-all shadow-lg"
               onClick={() => router.push('/login')}
             >
              Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl text-[#0F766E] mb-4">
                <Leaf size={20} /> GreenChain
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering communities to reduce food waste and feed the hungry through technology and trust.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Safety Standards</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Partner NGOs</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Download App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#0F766E] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-4">Connect</h4>
              <div className="flex gap-4">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#0F766E] hover:text-white transition-all cursor-pointer">
                    <span className="sr-only">{social}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08v.001zm0 1.802c-2.39 0-2.678.01-3.606.052-.924.041-1.42.192-1.756.323-.424.165-.726.36-1.042.676-.316.316-.51.618-.676 1.042-.131.336-.282.832-.322 1.756-.042.928-.052 1.216-.052 3.606 0 2.39.01 2.678.052 3.606.041.924.192 1.42.323 1.756.165.424.36.726.676 1.042.316.316.618.51 1.042.676.336.131.832.282 1.756.322.928.042 1.216.052 3.606.052 2.39 0 2.678-.01 3.606-.052.924-.041 1.42-.192 1.756-.323.424-.165.726-.36 1.042-.676.316-.316.51-.618.676-1.042.131-.336.282-.832.322-1.756.042-.928.052-1.216.052-3.606 0-2.39-.01-2.678-.052-3.606-.041-.924-.192-1.42-.323-1.756-.165-.424-.36-.726-.676-1.042-.316-.316-.618-.51-1.042-.676-.336-.131-.832-.282-1.756-.322-.928-.042-1.216-.052-3.606-.052zm0 4.378a3.222 3.222 0 100 6.444 3.222 3.222 0 000-6.444zm0 1.802a1.42 1.42 0 110 2.84 1.42 1.42 0 010-2.84z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 GreenChain Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-600">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom Animations CSS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes loading-bar {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default GreenChainLanding;