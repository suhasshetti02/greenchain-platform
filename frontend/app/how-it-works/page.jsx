"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Smartphone, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Users, 
  Heart,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import Button from '@/components/Button';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-[#0F766E] selection:text-white">
       {/* Inject Google Font */}
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
         <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#0F766E] font-bold text-lg hover:opacity-80 transition-opacity">
                <ArrowLeft size={20} /> Back to Home
            </Link>
            <div className="font-bold text-xl text-[#0F766E]">GreenChain</div>
            <div className="w-24"></div> {/* Spacer for centering */}
         </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="bg-[#0F766E] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-[80px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-sm font-medium mb-6">
                <HelpCircle size={16} /> Platform Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How GreenChain Works</h1>
            <p className="max-w-2xl mx-auto text-emerald-100 text-lg leading-relaxed">
                A simple, secure ecosystem connecting surplus food with the communities that need it most. 
                Technology handles the logistics so you can focus on the impact.
            </p>
        </div>
      </div>

      {/* --- Flow Diagram (Desktop) --- */}
      <div className="hidden lg:block container mx-auto px-8 -mt-10 mb-24 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100 flex items-center justify-between">
              <FlowStep 
                icon={<Smartphone size={32} />} 
                title="1. List Donation" 
                desc="Donor posts food details & photos." 
                color="bg-orange-100 text-orange-600"
              />
              <Arrow />
              <FlowStep 
                icon={<ShieldCheck size={32} />} 
                title="2. AI Verify" 
                desc="System checks expiration & quality." 
                color="bg-purple-100 text-purple-600"
              />
              <Arrow />
              <FlowStep 
                icon={<Users size={32} />} 
                title="3. Match" 
                desc="Nearby NGOs are notified instantly." 
                color="bg-blue-100 text-blue-600"
              />
              <Arrow />
              <FlowStep 
                icon={<Truck size={32} />} 
                title="4. Transport" 
                desc="Pick up & delivery verified by OTP." 
                color="bg-green-100 text-green-600"
              />
          </div>
      </div>

      {/* --- Detailed Roles --- */}
      <div className="container mx-auto px-4 md:px-8 space-y-24 py-12 lg:py-0">
          
          {/* For Donors */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:w-1/2 order-2 lg:order-1">
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative">
                      <div className="absolute -left-4 top-8 w-8 h-24 bg-orange-400 rounded-r-lg"></div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">For Donors</h3>
                      <ul className="space-y-6">
                          <ListItem 
                            title="List in Seconds" 
                            desc="Use our app to snap a photo and enter quantity. Our AI fills in the rest."
                          />
                          <ListItem 
                            title="Liability Protection" 
                            desc="Donations are tracked and verified, ensuring compliance with food safety laws."
                          />
                          <ListItem 
                            title="Impact Reports" 
                            desc="Get automated monthly reports on pounds of food rescued and CO2 diverted."
                          />
                      </ul>
                      <div className="mt-8 pt-6 border-t border-gray-100">
                          <Link href="/register?role=donor">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">Start Donating</Button>
                          </Link>
                      </div>
                  </div>
              </div>
              <div className="lg:w-1/2 order-1 lg:order-2 text-center lg:text-left">
                  <div className="inline-block p-4 rounded-2xl bg-orange-100 text-orange-600 mb-6">
                      <Heart size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Give Surplus, Gain Trust.</h2>
                  <p className="text-gray-500 text-lg leading-relaxed">
                      Restaurants, grocery stores, and corporate cafeterias can turn potential waste into community support. 
                      We handle the verification so you know your food is going to a good cause.
                  </p>
              </div>
          </div>

          {/* For Receivers */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:w-1/2 text-center lg:text-left">
                   <div className="inline-block p-4 rounded-2xl bg-blue-100 text-blue-600 mb-6">
                      <Users size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Reliable Food Sources.</h2>
                  <p className="text-gray-500 text-lg leading-relaxed">
                      Shelters, food banks, and community kitchens get real-time alerts for available food nearby. 
                      No more cold-calling or uncertain supplies.
                  </p>
              </div>
              <div className="lg:w-1/2">
                   <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative">
                      <div className="absolute -right-4 top-8 w-8 h-24 bg-blue-500 rounded-l-lg"></div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">For NGOs & Charities</h3>
                      <ul className="space-y-6">
                          <ListItem 
                            title="Instant Alerts" 
                            desc="Get notified via SMS or App notification when food matches your needs."
                          />
                          <ListItem 
                            title="Quality Assurance" 
                            desc="See food details and expiry times before claiming. Rejected items are flagged."
                          />
                          <ListItem 
                            title="Easy Logistics" 
                            desc="Coordinate pickups easily with our built-in distance and status tracking."
                          />
                      </ul>
                      <div className="mt-8 pt-6 border-t border-gray-100">
                          <Link href="/register?role=receiver">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Register as Receiver</Button>
                          </Link>
                      </div>
                  </div>
              </div>
          </div>

      </div>

      {/* --- FAQ Section --- */}
      <div className="bg-gray-100 py-24 mt-24">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                  <FAQItem 
                    question="Is it legal to donate leftover food?" 
                    answer="Yes! Developing legal frameworks like the Good Samaritan Food Donation Act protect donors from liability when donating to non-profits in good faith."
                  />
                  <FAQItem 
                    question="What types of food can I donate?" 
                    answer="We accept prepared meals, produce, baked goods, and shelf-stable items. High-risk items like raw meat require strict cold-chain verification."
                  />
                  <FAQItem 
                    question="Does it cost money to use GreenChain?" 
                    answer="For non-profits and receivers, the platform is free. For corporate donors, we offer premium analytics tiers, but basic listing is free."
                  />
              </div>
          </div>
      </div>

      {/* --- CTA --- */}
      <div className="bg-[#0F766E] py-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Ready to make a difference?</h2>
            <Link href="/register">
                <button className="bg-white text-[#0F766E] px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                    Join GreenChain Today
                </button>
            </Link>
      </div>

    </div>
  );
}

// --- Helpers ---

function FlowStep({ icon, title, desc, color }) {
    return (
        <div className="flex flex-col items-center text-center max-w-[200px]">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color}`}>
                {icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-500 leading-snug">{desc}</p>
        </div>
    )
}

function Arrow() {
    return (
        <div className="hidden lg:block text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </svg>
        </div>
    )
}

function ListItem({ title, desc }) {
    return (
        <li className="flex gap-4">
            <div className="mt-1 min-w-[24px]">
                <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
        </li>
    )
}

function FAQItem({ question, answer }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-[#0F766E]" />
                {question}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed pl-7">{answer}</p>
        </div>
    )
}
