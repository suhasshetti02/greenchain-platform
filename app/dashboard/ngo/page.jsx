import React, { useState } from 'react';
import { 
  Leaf, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle, 
  Clock, 
  Package, 
  MapPin, 
  Calendar, 
  Truck, 
  ChevronRight, 
  User,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

const GreenChainDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');

  // --- Mock Data ---
  const [stats, setStats] = useState({
    activeClaims: 3,
    completed: 12,
    total: 25,
    pending: 2
  });

  const [availableDonations, setAvailableDonations] = useState([
    { id: 1, title: 'Surplus Veg Meals', category: 'Cooked Food', quantity: '40 meals', location: 'MG Road, Bangalore', donor: 'Sunrise Restaurant', expiry: '3 hrs' },
    { id: 2, title: 'Fresh Bread Loaves', category: 'Baked Goods', quantity: '15 loaves', location: 'Indiranagar, Bangalore', donor: 'Daily Bread', expiry: '24 hrs' },
    { id: 3, title: 'Canned Beans & Corn', category: 'Groceries', quantity: '20 cans', location: 'Whitefield, Bangalore', donor: 'SuperMart X', expiry: '6 months' },
  ]);

  const [myClaims, setMyClaims] = useState([
    { id: 101, title: 'Rice & Curry Packets', location: 'Koramangala', status: 'Assigned', date: 'Oct 24, 2023' },
    { id: 102, title: 'Fruit Crates (Apples)', location: 'Jayanagar', status: 'Picked Up', date: 'Oct 23, 2023' },
    { id: 103, title: 'Milk Cartons', location: 'Hebbal', status: 'Delivered', date: 'Oct 22, 2023' },
  ]);

  // --- Actions ---
  const handleClaim = (id) => {
    const item = availableDonations.find(d => d.id === id);
    // Remove from available
    setAvailableDonations(availableDonations.filter(d => d.id !== id));
    // Add to claims (mock logic)
    const newClaim = {
      id: Date.now(),
      title: item.title,
      location: item.location,
      status: 'Assigned',
      date: 'Just now'
    };
    setMyClaims([newClaim, ...myClaims]);
    setStats({...stats, activeClaims: stats.activeClaims + 1});
    setActiveTab('logistics'); // Switch tab to show the flow
  };

  const updateStatus = (id, newStatus) => {
    setMyClaims(myClaims.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    if(newStatus === 'Delivered') {
      setStats({...stats, activeClaims: stats.activeClaims - 1, completed: stats.completed + 1});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* --- Navbar --- */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Leaf size={24} />
          </div>
          <span className="text-xl font-bold text-emerald-800 tracking-tight">GreenChain</span>
        </div>
        
        <div className="hidden md:flex font-medium text-slate-500">
          NGO Dashboard
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              HC
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-semibold text-slate-700 leading-tight">HopeCare NGO</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* --- Hero Section --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Welcome back, HopeCare NGO 👋</h1>
            <p className="text-slate-500">Manage claims, pickups, and deliveries of surplus food.</p>
          </div>
          <div className="hidden md:flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 items-center gap-3">
             <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
               <Truck size={20} />
             </div>
             <div className="text-sm">
               <p className="font-bold text-slate-700">Next Pickup</p>
               <p className="text-slate-400 text-xs">Today, 4:00 PM</p>
             </div>
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard 
            icon={<ShoppingBag size={20} />} 
            color="bg-orange-100 text-orange-600" 
            label="Active Claims" 
            value={stats.activeClaims} 
          />
          <StatCard 
            icon={<CheckCircle size={20} />} 
            color="bg-emerald-100 text-emerald-600" 
            label="Completed Deliveries" 
            value={stats.completed} 
          />
          <StatCard 
            icon={<Leaf size={20} />} 
            color="bg-blue-100 text-blue-600" 
            label="Total Donations" 
            value={stats.total} 
          />
          <StatCard 
            icon={<Clock size={20} />} 
            color="bg-purple-100 text-purple-600" 
            label="Pending Pickups" 
            value={stats.pending} 
          />
        </div>

        {/* --- Tabs --- */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <TabButton label="Available Donations" id="available" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="My Claims" id="claims" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Logistics" id="logistics" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>

          {/* --- Tab Content --- */}
          <div className="min-h-[300px]">
            {activeTab === 'available' && (
              <div className="grid gap-4">
                {availableDonations.length === 0 ? (
                  <EmptyState message="No donations available right now." />
                ) : (
                  availableDonations.map(donation => (
                    <AvailableCard key={donation.id} data={donation} onClaim={handleClaim} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-slate-500 text-sm border-b border-gray-100">
                      <th className="p-4 font-semibold">Donation Item</th>
                      <th className="p-4 font-semibold">Location</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myClaims.map(claim => (
                      <tr key={claim.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{claim.title}</td>
                        <td className="p-4 text-slate-500 text-sm">{claim.location}</td>
                        <td className="p-4 text-slate-500 text-sm">{claim.date}</td>
                        <td className="p-4">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-end gap-1">
                            Details <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="grid gap-6">
                 {myClaims.filter(c => c.status !== 'Delivered').length === 0 ? (
                    <EmptyState message="No active logistics tasks." />
                 ) : (
                   myClaims.filter(c => c.status !== 'Delivered').map(claim => (
                     <LogisticsCard key={claim.id} data={claim} onUpdate={updateStatus} />
                   ))
                 )}
                 {myClaims.filter(c => c.status !== 'Delivered').length > 0 && (
                   <p className="text-center text-xs text-slate-400 mt-4">NGOs are responsible for handling both claiming and logistics.</p>
                 )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="mt-12 py-8 border-t border-gray-200 text-center">
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          <Leaf size={14} /> GreenChain • Transparent food donation network
        </p>
      </footer>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const TabButton = ({ label, id, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(id)}
    className={`pb-3 text-sm font-semibold transition-all relative ${
      activeTab === id ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
    {activeTab === id && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>
    )}
  </button>
);

const AvailableCard = ({ data, onClaim }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-emerald-200 transition-all">
    <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
      <Package className="text-emerald-600" size={28} />
    </div>
    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="col-span-2 md:col-span-1">
        <h3 className="font-bold text-slate-800">{data.title}</h3>
        <p className="text-slate-500 text-sm">{data.donor}</p>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase font-bold">Category</p>
        <p className="text-slate-700 text-sm font-medium">{data.category}</p>
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase font-bold">Quantity</p>
        <p className="text-slate-700 text-sm font-medium">{data.quantity}</p>
      </div>
      <div>
         <p className="text-slate-400 text-xs uppercase font-bold">Expires</p>
         <p className="text-red-500 text-sm font-medium flex items-center gap-1">
            <Clock size={12} /> {data.expiry}
         </p>
      </div>
    </div>
    <div className="w-full md:w-auto mt-4 md:mt-0">
      <button 
        onClick={() => onClaim(data.id)}
        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-emerald-200"
      >
        Claim
      </button>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Assigned': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Picked Up': 'bg-blue-100 text-blue-700 border-blue-200',
    'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const LogisticsCard = ({ data, onUpdate }) => {
  const step = data.status === 'Assigned' ? 1 : data.status === 'Picked Up' ? 2 : 3;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{data.title}</h3>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <MapPin size={14} /> {data.location}
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Progress Bar */}
      <div className="relative flex items-center justify-between mb-8 px-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        ></div>

        <div className="flex flex-col items-center gap-2 bg-white px-2">
          <div className={`w-4 h-4 rounded-full border-2 ${step >= 1 ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}`}></div>
          <span className="text-xs font-medium text-slate-600">Assigned</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-white px-2">
           <div className={`w-4 h-4 rounded-full border-2 ${step >= 2 ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}`}></div>
           <span className="text-xs font-medium text-slate-600">Picked Up</span>
        </div>
        <div className="flex flex-col items-center gap-2 bg-white px-2">
           <div className={`w-4 h-4 rounded-full border-2 ${step >= 3 ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}`}></div>
           <span className="text-xs font-medium text-slate-600">Delivered</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
        {data.status === 'Assigned' && (
          <button 
            onClick={() => onUpdate(data.id, 'Picked Up')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Mark as Picked Up <ArrowRight size={16} />
          </button>
        )}
        {data.status === 'Picked Up' && (
          <button 
            onClick={() => onUpdate(data.id, 'Delivered')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Mark as Delivered <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
      <Leaf />
    </div>
    <p className="text-slate-500">{message}</p>
  </div>
);

export default GreenChainDashboard;