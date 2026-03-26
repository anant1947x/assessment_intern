import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Gift, ArrowRight, User, BarChart, Settings, Plus, Star, Heart } from 'lucide-react';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api`});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  let initialUser = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined' && stored !== 'null') {
      initialUser = JSON.parse(stored);
      // Failsafe in case stored object was empty
      if (initialUser && Object.keys(initialUser).length === 0) initialUser = null;
    }
  } catch (e) {
    localStorage.removeItem('user');
  }

  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

function RequireAuth({ children, adminOnly }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white flex flex-col">
      <nav className="bg-neutral-950/80 backdrop-blur-md border-b flex-shrink-0 border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center group-hover:bg-teal-400 transition transform group-hover:rotate-12 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Trophy size={20} className="text-neutral-950" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-200">GOLF<span className="text-white">REWARDS</span></span>
          </Link>
          <div className="flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition">Login</Link>
                <Link to="/signup" className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-lg hover:bg-neutral-200 transition shadow-lg">Get Started</Link>
              </>
            ) : (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm font-medium text-neutral-300 hover:text-teal-400 transition flex items-center gap-2">
                  <User size={16}/> {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm font-medium px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow flex flex-col">{children}</main>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: "radial-gradient(ellipse at top, #1a2a24 0%, #0a0a0a 100%)"}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-sm font-medium mb-4">
          <Star size={14} className="fill-teal-400" /> Connecting Performance with Philanthropy
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-tight text-white">
          Elevate Your Game.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-green-500">Change Lives.</span>
        </h1>
        
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Not your grandfather's golf site. Track your handicaps, compete in guaranteed monthly prize pools, and effortlessly donate winnings to high-impact charities.
        </p>

        <div className="pt-8 flex justify-center gap-4">
          <Link to="/signup" className="flex items-center gap-2 px-8 py-4 bg-teal-500 text-neutral-950 rounded-xl font-bold text-lg hover:bg-teal-400 hover:scale-105 transition shadow-[0_0_30px_rgba(20,184,166,0.3)]">
            Join the Club <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 pb-16">
          {[
            { t: 'Track Scores', d: 'Log courses and securely record your history.' },
            { t: 'Win Big', d: 'Match 5 numbers to claim the massive rollover pool.' },
            { t: 'Give Back', d: 'Winners pledge % to vetted global charities.' }
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col text-left backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-2">{f.t}</h3>
              <p className="text-neutral-400">{f.d}</p>
            </div>
          ))}
        </div>

        {/* Info & Mechanics Section */}
        <div className="w-full max-w-5xl mx-auto py-16 text-left border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">How the Draw Works</h2>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex gap-3"><span className="text-teal-500 font-bold">1.</span> Subscribers pick 5 lucky numbers (1-45) every month.</li>
                <li className="flex gap-3"><span className="text-teal-500 font-bold">2.</span> A percentage of all subscription revenue creates the massive Prize Pool.</li>
                <li className="flex gap-3"><span className="text-teal-500 font-bold">3.</span> Match all 5 numbers to win the Jackpot! (If no one wins, it rolls over to the next month).</li>
                <li className="flex gap-3"><span className="text-teal-500 font-bold">4.</span> Match 3 or 4 numbers for smaller cash rewards.</li>
                <li className="flex gap-3"><span className="text-teal-500 font-bold">5.</span> You MUST donate a minimum of 10% of any winnings to a listed charity to play again!</li>
              </ul>
            </div>
            
            <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl">
              <h2 className="text-3xl font-bold text-white mb-6">Explore Charities</h2>
              <p className="text-neutral-400 mb-6">Our platform partners with life-changing causes. When you win, they win.</p>
              <div className="space-y-4">
                {[
                  { n: 'Global Water Fund', d: 'Providing clean drinking water to communities.' },
                  { n: 'Kids Education Initiative', d: 'Funding primary schools globally.' },
                  { n: 'Wildlife Rescue Org', d: 'Conserving endangered species.' }
                ].map((c, i) => (
                  <div key={i} className="flex flex-col bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="text-teal-400 font-bold">{c.n}</span>
                    <span className="text-sm text-neutral-500 mt-1">{c.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-24">
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-neutral-200 hover:scale-105 transition shadow-xl">
            Start Your Subscription <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('1month');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      alert(`Processing secure mock payment for ₹${plan === '1month' ? '1' : '10'}...`);
      await api.post('/auth/signup', { email, password, plan, mockPaymentStatus: 'SUCCESS' });
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error signing up');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6" style={{ background: "radial-gradient(ellipse at bottom, #11221c 0%, #0a0a0a 100%)"}}>
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl"></div>
        <h2 className="text-3xl font-extrabold mb-2">Create Account</h2>
        <p className="text-neutral-400 mb-8">Join the exclusive platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input type="email" required className="mt-1 w-full bg-neutral-950 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500 transition" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-300">Password</label>
            <input type="password" required className="mt-1 w-full bg-neutral-950 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500 transition" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {[ { id: '1month', label: 'Monthly', price: '₹1' }, { id: '12month', label: 'Yearly', price: '₹10' } ].map(p => (
              <label key={p.id} className={`border p-4 rounded-xl cursor-pointer transition ${plan === p.id ? 'bg-teal-500/10 border-teal-500 scale-105' : 'bg-neutral-950 border-white/10 hover:border-white/30'}`}>
                <input type="radio" className="hidden" value={p.id} checked={plan === p.id} onChange={e=>setPlan(e.target.value)} />
                <div className="text-sm text-neutral-400">{p.label}</div>
                <div className="text-2xl font-bold mt-1 text-white">{p.price}</div>
              </label>
            ))}
          </div>

          <button type="submit" className="w-full mt-4 bg-teal-500 text-neutral-950 p-4 rounded-xl font-bold text-lg hover:bg-teal-400 transition shadow-[0_0_20px_rgba(20,184,166,0.2)]">Subscribe via Stripe</button>
        </form>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error logging in');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-neutral-950">
      <div className="w-full max-w-sm border border-white/10 p-8 rounded-3xl bg-neutral-900 shadow-xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email Address" required className="w-full bg-neutral-950 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-teal-500 transition" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full bg-neutral-950 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-teal-500 transition" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-white text-black p-4 rounded-xl font-bold hover:bg-neutral-200 transition">Access Pulse</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [charities, setCharities] = useState([]);
  
  // Score Input state
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState('');

  // Charity Donation Stste
  const [selectedCharity, setSelectedCharity] = useState('');
  const [donatePerc, setDonatePerc] = useState(10);

  // Proof State
  const [proofUrl, setProofUrl] = useState('');

  const fetchProfile = async () => {
    const res = await api.get('/game/profile');
    setProfile(res.data);
    setNumbers(res.data.selectedNumbers.length ? res.data.selectedNumbers : [1,2,3,4,5]);
  };
  const fetchCharities = async () => {
    const res = await api.get('/charity');
    setCharities(res.data);
  };

  useEffect(() => { fetchProfile(); fetchCharities(); }, []);

  const handleUpdateNumbers = async () => {
    try {
      const res = await api.post('/game/pick-numbers', { numbers });
      setProfile({...profile, selectedNumbers: res.data.numbers});
      alert('Draw Numbers Locked In!');
    } catch(e) {
      alert(e.response?.data?.msg || 'Error updating numbers');
    }
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/game/scores', { courseName, score });
      setCourseName(''); setScore('');
      fetchProfile();
    } catch(e) {
      alert(e.response?.data?.msg || 'Error adding score');
    }
  };
  
  const handleDonate = async () => {
    try {
      await api.post('/charity/donate', { charityId: selectedCharity, percentage: donatePerc });
      alert('Donation successful! You are now eligible for next draw.');
      fetchProfile();
    } catch(e) {
      alert(e.response?.data?.msg || 'Error donating');
    }
  }

  const handleUploadProof = async () => {
    try {
      await api.post('/game/upload-proof', { proofUrl });
      alert('Proof uploaded. Waiting for admin review!');
      fetchProfile();
      setProofUrl('');
    } catch(e) {
      alert(e.response?.data?.msg || 'Error uploading proof');
    }
  }

  if(!profile) return <div className="text-center p-20">Loading Dashboard...</div>;

  const requiresDonation = profile.walletBalance > 0 && !profile.selectedCharity;

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-6 gap-6 grid grid-cols-1 lg:grid-cols-3 text-neutral-200">
      
      {/* LEFT COL */}
      <div className="space-y-6 lg:col-span-2">
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
           <h2 className="text-2xl font-bold text-white mb-1">Commander Center</h2>
           <p className="text-sm text-neutral-400 mb-6">Subscription: <span className="text-teal-400">{profile.subscriptionActive ? 'ACTIVE' : 'INACTIVE'}</span></p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5">
                 <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Pending Winnings</p>
                 <p className="text-3xl font-extrabold text-teal-400">₹{profile.walletBalance.toFixed(2)}</p>
                 {profile.payoutStatus !== 'none' && (
                    <div className="mt-2 text-xs font-bold px-2 py-1 bg-white/5 rounded-md inline-block">
                      Status: <span className={
                        profile.payoutStatus === 'pending' ? 'text-yellow-400' :
                        profile.payoutStatus === 'approved' ? 'text-blue-400' :
                        'text-teal-400'
                      }>{profile.payoutStatus.toUpperCase()}</span>
                    </div>
                 )}
              </div>
              <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5">
                 <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Total Donated</p>
                 <p className="text-3xl font-extrabold text-white">₹{profile.totalDonated.toFixed(2)}</p>
                 <p className="text-sm text-neutral-500 mt-2 font-bold">Total Won: ₹{profile.totalWinnings.toFixed(2)}</p>
              </div>
           </div>

           {profile.payoutStatus === 'pending' && !profile.proofUrl && (
             <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
               <h4 className="text-blue-400 font-bold mb-2">Claim Your Winnings</h4>
               <p className="text-xs text-neutral-300 mb-3">You won the draw! Please upload a link to your official golf score proof to verify your account and receive payment.</p>
               <div className="flex flex-col sm:flex-row gap-2">
                 <input type="text" placeholder="URL to image proof..." className="flex-1 bg-neutral-950 border border-white/10 p-3 rounded-lg text-sm outline-none" value={proofUrl} onChange={e=>setProofUrl(e.target.value)} />
                 <button onClick={handleUploadProof} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-sm">Submit</button>
               </div>
             </div>
           )}
        </div>

        {requiresDonation && (
           <div className="bg-yellow-900/40 border border-yellow-500/50 p-6 rounded-3xl backdrop-blur-sm">
             <h3 className="font-bold text-yellow-500 flex items-center gap-2 mb-2"><Gift size={18} /> Action Required: Donate Winnings</h3>
             <p className="text-sm text-neutral-300 mb-4">You must commit at least 10% of your ₹{profile.walletBalance.toFixed(2)} winnings to charity to unlock next month's entry.</p>
             <div className="flex gap-4 items-end">
               <div className="flex-1">
                 <select value={selectedCharity} onChange={e=>setSelectedCharity(e.target.value)} className="w-full bg-neutral-950 border border-white/20 p-3 rounded-xl">
                   <option value="">Select a Charity...</option>
                   {charities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                 </select>
               </div>
               <div className="w-24">
                 <input type="number" min="10" max="100" value={donatePerc} onChange={e=>setDonatePerc(e.target.value)} className="w-full bg-neutral-950 border border-white/20 p-3 rounded-xl text-center" />
               </div>
               <button onClick={handleDonate} className="bg-yellow-500 text-yellow-950 font-bold px-6 py-3 rounded-xl hover:bg-yellow-400">Donate</button>
             </div>
           </div>
        )}

        <div className="bg-neutral-900 border border-white/5 p-8 rounded-3xl">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-xl text-white">Lucky Draw Numbers</h3>
             <span className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-xs font-semibold">Auto-Synced to Scores</span>
           </div>
           
           <div className="flex flex-wrap gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-16 h-16 flex items-center justify-center text-2xl font-black bg-neutral-950 border border-white/10 rounded-2xl transition placeholder-neutral-700 text-teal-500"
                >
                  {numbers[i] || '-'}
                </div>
              ))}
           </div>
           <p className="text-xs text-neutral-500 italic mt-2">Your 5 latest golf scores automatically act as your entry numbers for the monthly jackpot draw.</p>
        </div>
      </div>

      {/* RIGHT COL - GOLF SCORES */}
      <div className="bg-neutral-900 border border-white/5 p-6 rounded-3xl flex flex-col max-h-[800px]">
        <h3 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><BarChart size={20}/> Performance Log</h3>
        <p className="text-xs text-neutral-400 mb-6">Enter your latest 5 active Stableford scores (between 1-45). These represent your exact entry tickets into the monthly lucky draw.</p>        <form onSubmit={handleAddScore} className="mb-6 bg-neutral-950 p-4 rounded-2xl border border-white/5">
          <input type="text" placeholder="Course Name" required className="w-full bg-neutral-900 border border-white/10 p-3 rounded-xl mb-3 outline-none focus:border-teal-500" value={courseName} onChange={e=>setCourseName(e.target.value)} />
          <div className="flex gap-3">
             <input type="number" placeholder="Score" required className="flex-1 bg-neutral-900 border border-white/10 p-3 rounded-xl outline-none focus:border-teal-500" value={score} onChange={e=>setScore(e.target.value)} />
             <button type="submit" className="bg-teal-500 p-3 rounded-xl text-black inline-flex justify-center items-center font-bold hover:bg-teal-400 transition"><Plus size={20}/></button>
          </div>
        </form>

        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
           {profile.golfScores.length === 0 ? <p className="text-center text-neutral-500 py-10 text-sm">No scores tracked yet. Hit the green.</p> : profile.golfScores.slice().reverse().map(s => (
             <div key={s._id} className="flex bg-neutral-950 border border-white/5 p-4 rounded-2xl items-center justify-between">
               <div>
                  <h4 className="font-bold text-white text-sm">{s.courseName}</h4>
                  <p className="text-xs text-neutral-500">{new Date(s.date).toLocaleDateString()}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 text-teal-400 flex items-center justify-center font-black">
                 {s.score}
               </div>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
}

function Admin() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [charityName, setCharityName] = useState('');
  const [charityDesc, setCharityDesc] = useState('');

  const fetchStats = async () => {
    try {
      const {data} = await api.get('/admin/stats');
      setStats(data);
    } catch(err) { console.error('Error fetching admin data'); }
  };

  const fetchUsers = async () => {
    try {
      const {data} = await api.get('/admin/users');
      setUsers(data);
    } catch(err) { console.error('Error fetching users'); }
  };

  const fetchCharities = async () => {
    try {
      const {data} = await api.get('/admin/charities');
      setCharities(data);
    } catch(err) { console.error('Error fetching charities'); }
  };

  useEffect(() => { 
    if(activeTab === 'dashboard') fetchStats(); 
    if(activeTab === 'users') fetchUsers();
    if(activeTab === 'charities') fetchCharities();
  }, [activeTab]);

  const handleRunDraw = async () => {
    if(!window.confirm('Run the monthly draw? This instantly triggers distribution computations.')) return;
    try {
      await api.post('/admin/run-draw');
      alert('Draw Executed!');
      fetchStats();
    } catch(e) {
      alert(e.response?.data?.msg || 'Error running draw');
    }
  }
  
  const handleAddCharity = async (e) => {
    e.preventDefault();
    await api.post('/admin/charity', { name: charityName, description: charityDesc });
    setCharityName(''); setCharityDesc('');
    alert('Charity Added.');
    fetchCharities();
  }

  const handleDeleteCharity = async (id) => {
    if(!window.confirm('Remove this charity?')) return;
    await api.delete(`/admin/charity/${id}`);
    fetchCharities();
  }

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure you want to delete this user?')) return;
    await api.delete(`/admin/user/${id}`);
    fetchUsers();
  }

  const handleApprovePayout = async (userId) => {
    if(!window.confirm('Approve this verified user payout?')) return;
    try {
      await api.post(`/admin/approve-payout/${userId}`);
      alert('Payout Approved and Transferred!');
      fetchStats();
    } catch(err) {
      alert('Error approving payout');
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-6 gap-6 grid grid-cols-1 lg:grid-cols-4 text-neutral-200">
       <div className="lg:col-span-1 space-y-4">
         <div className="bg-neutral-900 overflow-hidden rounded-3xl border border-white/5 font-mono text-sm">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-6 py-4 transition flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-teal-500/20 text-teal-400 font-bold border-l-4 border-teal-500' : 'hover:bg-white/5 text-neutral-400'}`}>
             <Settings size={18} /> Dashboard & Draws
           </button>
           <button onClick={() => setActiveTab('users')} className={`w-full text-left px-6 py-4 transition flex items-center gap-3 ${activeTab === 'users' ? 'bg-teal-500/20 text-teal-400 font-bold border-l-4 border-teal-500' : 'hover:bg-white/5 text-neutral-400'}`}>
             <User size={18} /> Manage Users
           </button>
           <button onClick={() => setActiveTab('charities')} className={`w-full text-left px-6 py-4 transition flex items-center gap-3 ${activeTab === 'charities' ? 'bg-teal-500/20 text-teal-400 font-bold border-l-4 border-teal-500' : 'hover:bg-white/5 text-neutral-400'}`}>
             <Heart size={18} /> Charities
           </button>
         </div>

         <button onClick={handleRunDraw} className="w-full p-6 rounded-3xl bg-red-500 text-white font-black text-xl hover:bg-red-400 hover:scale-[1.02] shadow-[0_0_30px_rgba(239,68,68,0.3)] transition transform duration-300 flex flex-col items-center mt-6">
            <Trophy size={48} className="mb-2 opacity-80" />
            INITIATE DRAW
         </button>
       </div>

       <div className="lg:col-span-3 bg-neutral-900 border border-white/5 p-8 rounded-3xl font-mono text-sm leading-relaxed overflow-hidden min-h-[500px]">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">System Telemetry & Actions</h2>
              {stats ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="p-4 bg-neutral-950 border border-white/5 rounded-2xl">
                        <p className="text-neutral-500 uppercase text-xs mb-1">Active Subscribers</p>
                        <p className="text-2xl font-bold text-teal-400">{stats.totalUsers}</p>
                     </div>
                     <div className="p-4 bg-neutral-950 border border-white/5 rounded-2xl">
                        <p className="text-neutral-500 uppercase text-xs mb-1">Recorded Draws</p>
                        <p className="text-2xl font-bold text-white">{stats.draws.length}</p>
                     </div>
                  </div>

                  {stats.pendingPayouts && stats.pendingPayouts.length > 0 && (
                    <div>
                      <h3 className="text-yellow-400 font-bold mb-4 uppercase text-xs pt-4 border-t border-white/5">Pending Payouts for Review</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {stats.pendingPayouts.map((p, i) => (
                          <div key={i} className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl">
                            <div>
                              <p className="text-white font-bold">{p.email}</p>
                              <p className="text-yellow-400 text-sm">Winnings: ₹{p.walletBalance.toFixed(2)}</p>
                              {p.proofUrl ? (
                                <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-teal-400 text-xs underline mt-1 block">View Score Proof</a>
                              ) : (
                                <p className="text-red-400 text-xs mt-1">Pending Proof Upload from User</p>
                              )}
                            </div>
                            <button onClick={() => handleApprovePayout(p._id)} disabled={!p.proofUrl} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50">
                              Approve Payout
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-neutral-300 font-bold mb-4 uppercase text-xs pt-4 border-t border-white/5">Draw History Log</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {stats.draws.map((d, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center bg-neutral-950 border border-white/5 p-5 rounded-2xl hover:border-teal-500/30 transition gap-2">
                           <div className="flex flex-col gap-1">
                              <div className="flex gap-2 items-center">
                                 <div className="text-teal-400 font-bold tracking-widest">{d.winningNumbers.join(' - ')}</div>
                                 <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full uppercase flex-shrink-0">Computed</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">{new Date(d.createdAt || d.date).toLocaleString()}</p>
                           </div>
                           <div className="text-left sm:text-right text-xs">
                              <p className="text-white font-bold opacity-90"><span className="text-neutral-600">Pool:</span> ₹{(d.totalPool || 0).toFixed(2)}</p>
                              <p className="text-teal-400 font-bold"><span className="text-neutral-600">Rollover:</span> ₹{(d.match5Rollover || 0).toFixed(2)}</p>
                              <p className="text-yellow-500 font-bold"><span className="text-neutral-600">Charity Unmatched:</span> ₹{(d.charityDonationFromUnmatched || 0).toFixed(2)}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : <p className="animate-pulse text-teal-500">Loading Telemetry...</p>}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">Manage Users</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {users.length === 0 ? <p className="text-neutral-500">No users found.</p> : users.map(u => (
                  <div key={u._id} className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <p className="text-white font-bold">{u.email}</p>
                      <p className="text-xs text-neutral-500 mt-1">Plan: {u.plan || 'none'} | Active: {u.subscriptionActive ? 'Yes' : 'No'}</p>
                      <p className="text-xs text-neutral-500">Winnings: ₹{(u.totalWinnings || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleDeleteUser(u._id)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs hover:bg-red-500 hover:text-white transition">
                      Delete User
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'charities' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">Manage Charities</h2>
              <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5 mb-8">
                <h3 className="font-bold text-white mb-4">Add New Charity</h3>
                <form onSubmit={handleAddCharity} className="space-y-3">
                  <input placeholder="Charity Name" required value={charityName} onChange={e=>setCharityName(e.target.value)} className="w-full bg-neutral-900 border border-white/10 p-3 rounded-xl outline-none text-white text-sm" />
                  <textarea placeholder="Charity Description" required value={charityDesc} onChange={e=>setCharityDesc(e.target.value)} className="w-full bg-neutral-900 border border-white/10 p-3 rounded-xl outline-none resize-none h-24 text-white text-sm" />
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm">Submit New Charity</button>
                </form>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-neutral-400 mb-2">Existing Charities</h3>
                {charities.length === 0 ? <p className="text-neutral-500 text-sm">No charities listed.</p> : charities.map(c => (
                  <div key={c._id} className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <p className="text-white font-bold mb-1">{c.name}</p>
                      <p className="text-xs text-neutral-400 line-clamp-2">{c.description}</p>
                    </div>
                    <button onClick={() => handleDeleteCharity(c._id)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs hover:bg-red-500 hover:text-white transition whitespace-nowrap">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
       </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth adminOnly><Admin /></RequireAuth>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
