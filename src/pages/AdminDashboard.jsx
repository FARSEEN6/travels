import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import TicketsAdminView from '../components/TicketsAdminView';
import AllTicketsAdminView from '../components/AllTicketsAdminView';

// Curated seed destinations for fallback/initialization
const SEED_DESTINATIONS = [
  {
    id: 'seed-1',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    code: 'RUH',
    landmark: 'Kingdom Centre',
    category: 'INTERNATIONAL',
    price: '₹12,200',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
    description: 'Kingdom Centre & Historic Diriyah. Heart of the Arabian Peninsula.',
    highlights: 'Kingdom Centre Tower, Historic Diriyah UNESCO site, Boulevard Riyadh City, National Museum',
    visa_info: 'Tourist eVisa available online (valid 1 year, multiple entry). GCC residency visa eligible.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-2',
    country: 'UAE',
    city: 'Dubai',
    code: 'DXB',
    landmark: 'Burj Khalifa',
    category: 'INTERNATIONAL',
    price: '₹14,000',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    description: 'Burj Khalifa, Palm Jumeirah & Downtown Dubai.',
    highlights: 'Burj Khalifa 148th floor, Dubai Mall, Desert Safari with BBQ dinner, Dubai Marina yacht cruise',
    visa_info: '30-day and 60-day tourist visas available within 24-48 hours with express processing.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-3',
    country: 'Qatar',
    city: 'Doha',
    code: 'DOH',
    landmark: 'Doha Corniche',
    category: 'INTERNATIONAL',
    price: '₹18,500',
    image_url: 'https://images.unsplash.com/photo-1579606032834-de00b21a86b1?auto=format&fit=crop&w=800&q=80',
    description: 'Museum of Islamic Art, Souq Waqif & Futuristic Skyline.',
    highlights: 'Souq Waqif traditional market, Museum of Islamic Art, Katara Cultural Village, The Pearl Island',
    visa_info: 'Visa-on-arrival free for Indian passport holders with confirmed hotel and return ticket.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-4',
    country: 'Oman',
    city: 'Muscat',
    code: 'MCT',
    landmark: 'Sultan Qaboos Mosque',
    category: 'INTERNATIONAL',
    price: '₹13,800',
    image_url: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
    description: 'Sultan Qaboos Grand Mosque & Mutrah Corniche.',
    highlights: 'Sultan Qaboos Grand Mosque, Mutrah Souq, Bimmah Sinkhole, Wahiba Sands desert camp',
    visa_info: '10-day or 30-day tourist eVisa processed in 2-3 working days.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-5',
    country: 'Kuwait',
    city: 'Kuwait City',
    code: 'KWI',
    landmark: 'Kuwait Towers',
    category: 'INTERNATIONAL',
    price: '₹14,800',
    image_url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
    description: 'Kuwait Towers & Arabian Gulf coastline.',
    highlights: 'Kuwait Towers, The Avenues mall, Grand Mosque of Kuwait, Souq Al-Mubarakiya',
    visa_info: 'eVisa for eligible professions and GCC residents. Commercial entry visa available.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-6',
    country: 'Bahrain',
    city: 'Manama',
    code: 'BAH',
    landmark: 'World Trade Center',
    category: 'INTERNATIONAL',
    price: '₹16,200',
    image_url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80',
    description: 'Bahrain World Trade Center & Bab Al Bahrain.',
    highlights: 'Bahrain World Trade Center, Al Fateh Grand Mosque, Qal\'at al-Bahrain fort, Tree of Life',
    visa_info: 'Tourist eVisa available online with instant pre-approval.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  },
  {
    id: 'seed-7',
    country: 'Singapore',
    city: 'Singapore',
    code: 'SIN',
    landmark: 'Marina Bay Sands',
    category: 'INTERNATIONAL',
    price: '₹17,500',
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    description: 'Marina Bay, Gardens by the Bay & Sentosa Island.',
    highlights: 'Gardens by the Bay Supertrees, Universal Studios Sentosa, Marina Bay SkyPark, Jewel Changi',
    visa_info: 'Singapore SG Arrival Card and e-Visa through authorized visa agents (3-5 working days).',
    is_active: true,
    kerala_origin: 'Cochin (COK)'
  },
  {
    id: 'seed-8',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    code: 'KUL',
    landmark: 'Petronas Twin Towers',
    category: 'INTERNATIONAL',
    price: '₹15,900',
    image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    description: 'Petronas Twin Towers & Batu Caves.',
    highlights: 'Petronas Twin Towers Skybridge, Batu Caves limestone shrine, Genting Highlands, Bukit Bintang',
    visa_info: 'Visa-free entry for Indian citizens up to 30 days with MDAC registration.',
    is_active: true,
    kerala_origin: 'Cochin (COK)'
  },
  {
    id: 'seed-9',
    country: 'Thailand',
    city: 'Bangkok',
    code: 'BKK',
    landmark: 'Wat Arun Temple',
    category: 'INTERNATIONAL',
    price: '₹16,800',
    image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    description: 'Wat Arun & Grand Palace. Tropical temples and vibrant floating markets.',
    highlights: 'Wat Arun, Grand Palace, Chao Phraya river cruise, Floating markets',
    visa_info: 'Visa-free entry for Indian passport holders or instant eVisa.',
    is_active: true,
    kerala_origin: 'Cochin (COK)'
  },
  {
    id: 'seed-10',
    country: 'Sri Lanka',
    city: 'Colombo',
    code: 'CMB',
    landmark: 'Sigiriya Fortress',
    category: 'INTERNATIONAL',
    price: '₹9,900',
    image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
    description: 'Sigiriya Rock & Colombo Coast. Ancient cultural fortress.',
    highlights: 'Sigiriya Ancient Rock, Temple of the Tooth, Galle Fort, Bentota beach',
    visa_info: 'Free tourist visa / ETA for Indian citizens through online portal.',
    is_active: true,
    kerala_origin: 'Trivandrum (TRV)'
  },
  {
    id: 'seed-11',
    country: 'Europe',
    city: 'London / Paris',
    code: 'LHR',
    landmark: 'Eiffel Tower & West Europe',
    category: 'INTERNATIONAL',
    price: '₹38,500',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'Eiffel Tower, London Eye & Alps.',
    highlights: 'Eiffel Tower, Louvre Museum, London Eye, Swiss Alps excursion',
    visa_info: 'Schengen Visa for European countries. UK Standard Visitor Visa.',
    is_active: true,
    kerala_origin: 'Cochin (COK)'
  },
  {
    id: 'seed-12',
    country: 'India',
    city: 'Delhi',
    code: 'DEL',
    landmark: 'Taj Mahal & Delhi',
    category: 'DOMESTIC',
    price: '₹4,800',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'Taj Mahal & Historic Capitals.',
    highlights: 'Taj Mahal Agra, Red Fort Delhi, Qutub Minar, India Gate',
    visa_info: 'Domestic Travel. Valid Government ID required for airport entry.',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  }
];

const AdminDashboard = () => {
  const { user, getAllRegisteredUsers, setUserAsAdmin, removeUserAsAdmin, checkIsAdmin } = useAuth();
  
  // Navigation
  const [activeSection, setActiveSection] = useState('countries'); // 'dashboard', 'countries', 'tickets', 'all_tickets', 'airlines', 'users', 'admins'
  
  // Destinations/Countries state
  const [destinations, setDestinations] = useState([]);
  const [destSearch, setDestSearch] = useState('');
  const [destCategoryFilter, setDestCategoryFilter] = useState('ALL');
  const [showDestForm, setShowDestForm] = useState(false);
  const [editingDestId, setEditingDestId] = useState(null);
  const [destForm, setDestForm] = useState({
    country: '',
    city: '',
    code: '',
    landmark: '',
    category: 'INTERNATIONAL',
    price: '',
    image_url: '',
    description: '',
    highlights: '',
    visa_info: '',
    is_active: true,
    kerala_origin: 'Kozhikode (CCJ)'
  });
  
  // Users state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  
  // New Admin by Email
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // Airlines state
  const [airlines, setAirlines] = useState([]);
  const [airlineData, setAirlineData] = useState({ name: '', logo_url: '' });
  
  // Tickets navigation
  const [selectedDestinationForTickets, setSelectedDestinationForTickets] = useState(null);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // ─── Initial Data Loading ──────────────────────────────────────────
  useEffect(() => {
    loadDestinations();
    loadUsers();
    loadAirlines();
    loadTicketsCount();
  }, []);

  // Helper to load destinations from Supabase or localStorage
  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });
      const seedMap = new Map();
      SEED_DESTINATIONS.forEach(s => seedMap.set(s.code, s));

      if (!error && data && data.length > 0) {
        const merged = data.map(item => {
          const s = seedMap.get(item.code);
          if (s) {
            seedMap.delete(item.code);
            return {
              ...s,
              ...item,
              id: item.id || s.id,
              landmark: item.landmark || s.landmark,
              description: item.description || s.description,
              highlights: item.highlights || s.highlights,
              visa_info: item.visa_info || s.visa_info,
              price: item.price || s.price,
              image_url: item.image_url || s.image_url,
              kerala_origin: item.kerala_origin || s.kerala_origin,
              is_active: item.is_active !== undefined ? item.is_active : true
            };
          }
          return item;
        });

        // Append any remaining seed items
        seedMap.forEach(rem => merged.push(rem));

        setDestinations(merged);
        localStorage.setItem('aashmi_destinations', JSON.stringify(merged));
      } else {
        const local = localStorage.getItem('aashmi_destinations');
        setDestinations(local ? JSON.parse(local) : SEED_DESTINATIONS);
      }
    } catch (e) {
      console.warn("Using local destinations cache", e);
      const local = localStorage.getItem('aashmi_destinations');
      setDestinations(local ? JSON.parse(local) : SEED_DESTINATIONS);
    }
  };

  const saveDestinationsToStorage = (updated) => {
    setDestinations(updated);
    localStorage.setItem('aashmi_destinations', JSON.stringify(updated));
  };

  const loadUsers = async () => {
    const localUsers = getAllRegisteredUsers();
    try {
      const { data } = await supabase.from('registered_users').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        // Merge Supabase users with localUsers by email
        const map = new Map();
        localUsers.forEach(u => map.set(u.email?.toLowerCase(), u));
        data.forEach(u => {
          const email = u.email?.toLowerCase();
          if (map.has(email)) {
            map.set(email, { ...map.get(email), ...u });
          } else {
            map.set(email, u);
          }
        });
        setRegisteredUsers(Array.from(map.values()));
        return;
      }
    } catch (e) {
      console.warn("Error fetching registered_users from supabase:", e);
    }
    setRegisteredUsers(localUsers);
  };

  const loadAirlines = async () => {
    try {
      const { data } = await supabase.from('airline_partners').select('*').order('created_at', { ascending: false });
      if (data) setAirlines(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadTicketsCount = async () => {
    try {
      const { count, error } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
      if (!error && count !== null) setTotalTicketsCount(count);
    } catch (e) {
      console.warn(e);
    }
  };

  // ─── Destination CRUD Handlers ─────────────────────────────────────
  const handleOpenAddDest = () => {
    setEditingDestId(null);
    setDestForm({
      country: '',
      city: '',
      code: '',
      landmark: '',
      category: 'INTERNATIONAL',
      price: '',
      image_url: '',
      description: '',
      highlights: '',
      visa_info: '',
      is_active: true,
      kerala_origin: 'Kozhikode (CCJ)'
    });
    setShowDestForm(true);
  };

  const handleEditDest = (dest) => {
    setEditingDestId(dest.id);
    setDestForm({
      country: dest.country || '',
      city: dest.city || '',
      code: dest.code || '',
      landmark: dest.landmark || '',
      category: dest.category || 'INTERNATIONAL',
      price: dest.price || '',
      image_url: dest.image_url || '',
      description: dest.description || '',
      highlights: dest.highlights || '',
      visa_info: dest.visa_info || '',
      is_active: dest.is_active !== undefined ? dest.is_active : true,
      kerala_origin: dest.kerala_origin || 'Kozhikode (CCJ)'
    });
    setShowDestForm(true);
  };

  const handleToggleDestActive = async (dest) => {
    const newStatus = !dest.is_active;
    const updated = destinations.map(d => d.id === dest.id ? { ...d, is_active: newStatus } : d);
    saveDestinationsToStorage(updated);

    // Try updating Supabase if it's a UUID/DB record
    try {
      await supabase.from('destinations').update({ is_active: newStatus }).eq('id', dest.id);
    } catch (e) {
      console.warn("Supabase active toggle note:", e);
    }
    showToast(`"${dest.country}" marked as ${newStatus ? 'Active' : 'Inactive'}`);
  };

  const handleDeleteDest = async (dest) => {
    if (!window.confirm(`Are you sure you want to delete "${dest.country}"? This will also remove associated tickets.`)) {
      return;
    }
    const updated = destinations.filter(d => d.id !== dest.id);
    saveDestinationsToStorage(updated);

    try {
      await supabase.from('destinations').delete().eq('id', dest.id);
    } catch (e) {
      console.warn("Supabase delete note:", e);
    }
    showToast(`Deleted ${dest.country} successfully.`);
  };

  const handleDestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const code = destForm.code.trim().toUpperCase() || destForm.country.substring(0, 3).toUpperCase();
      const city = destForm.city.trim() || destForm.country;
      const landmark = destForm.landmark.trim() || `${destForm.country} Landmark`;

      const payload = {
        ...destForm,
        code,
        city,
        landmark,
        airport_name: `${city} Airport`
      };

      // Basic payload safe for Supabase schema
      const safeDbPayload = {
        country: payload.country,
        city: payload.city,
        code: payload.code,
        airport_name: payload.airport_name,
        price: payload.price,
        category: payload.category,
        image_url: payload.image_url
      };

      if (editingDestId) {
        // Update
        const updated = destinations.map(d => d.id === editingDestId ? { ...d, ...payload } : d);
        saveDestinationsToStorage(updated);

        try {
          if (editingDestId.length > 25) {
            const { error } = await supabase.from('destinations').update(payload).eq('id', editingDestId);
            if (error && (error.code === 'PGRST204' || error.code === '42703')) {
              await supabase.from('destinations').update(safeDbPayload).eq('id', editingDestId);
            }
          }
        } catch (err) {
          console.warn("Supabase update error:", err);
        }
        showToast(`Country "${destForm.country}" updated successfully!`);
      } else {
        // Create
        const newId = 'dest_' + Date.now();
        const newDest = { id: newId, ...payload, created_at: new Date().toISOString() };
        const updated = [newDest, ...destinations];
        saveDestinationsToStorage(updated);

        try {
          const { data, error } = await supabase.from('destinations').insert([payload]).select();
          if (error && (error.code === 'PGRST204' || error.code === '42703')) {
            const res = await supabase.from('destinations').insert([safeDbPayload]).select();
            if (res.data?.[0]?.id) {
              newDest.id = res.data[0].id;
              saveDestinationsToStorage([newDest, ...destinations]);
            }
          } else if (data?.[0]?.id) {
            newDest.id = data[0].id;
            saveDestinationsToStorage([newDest, ...destinations]);
          }
        } catch (err) {
          console.warn("Supabase insert error:", err);
        }
        showToast(`New Country "${destForm.country}" created successfully!`);
      }

      setShowDestForm(false);
      setEditingDestId(null);
    } catch (err) {
      alert("Error saving country: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload helper (Cloudinary)
  const handleCountryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Tip: You can paste any image URL directly into the Image URL box, or configure Cloudinary in .env");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setDestForm({ ...destForm, image_url: data.secure_url });
        showToast("Image uploaded successfully!");
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Admin Role Management ─────────────────────────────────────────
  const handleToggleAdminRole = (targetEmail) => {
    if (!targetEmail) return;
    const isCurrentlyAdmin = checkIsAdmin(targetEmail);
    if (isCurrentlyAdmin) {
      if (targetEmail.toLowerCase() === 'farseen.travels@gmail.com') {
        alert("Super-admin account cannot be removed.");
        return;
      }
      if (window.confirm(`Remove admin privileges for ${targetEmail}?`)) {
        removeUserAsAdmin(targetEmail);
        loadUsers();
        showToast(`Admin privileges revoked from ${targetEmail}`);
      }
    } else {
      if (window.confirm(`Grant admin privileges to ${targetEmail}?`)) {
        setUserAsAdmin(targetEmail);
        loadUsers();
        showToast(`Granted admin privileges to ${targetEmail} 👑`);
      }
    }
  };

  const handleAddAdminByEmail = (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setUserAsAdmin(newAdminEmail.trim());
    setNewAdminEmail('');
    loadUsers();
    showToast(`Added ${newAdminEmail} as Admin! 👑`);
  };

  // ─── Airline Handlers ──────────────────────────────────────────────
  const handleAirlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('airline_partners').insert([airlineData]);
      if (error) throw error;
      showToast("Airline Partner saved successfully!");
      setAirlineData({ name: '', logo_url: '' });
      loadAirlines();
    } catch (error) {
      alert("Error saving airline: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toast notification helper
  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Filtered Destinations
  const filteredDestinations = destinations.filter(d => {
    const matchesSearch = !destSearch || 
      d.country?.toLowerCase().includes(destSearch.toLowerCase()) || 
      d.city?.toLowerCase().includes(destSearch.toLowerCase()) ||
      d.code?.toLowerCase().includes(destSearch.toLowerCase());
    const matchesCategory = destCategoryFilter === 'ALL' || d.category === destCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Users
  const filteredUsers = registeredUsers.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="view-section bg-slate-50 dark:bg-inverse-surface min-h-[900px] flex flex-col md:flex-row flex-grow w-full">
      {/* ─── TOAST NOTIFICATION ─── */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-xs font-bold">{statusMessage}</span>
        </div>
      )}

      {/* ─── ADMIN SIDEBAR ─── */}
      <aside className="w-full md:w-72 bg-white dark:bg-on-primary-fixed border-r border-slate-200 dark:border-outline p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Brand & Status */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#072a34] to-[#11A8CD] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="font-headline-lg font-black text-slate-900 dark:text-secondary-fixed text-lg leading-tight">
                Admin Console
              </h2>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Authorized Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => { setActiveSection('dashboard'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeSection === 'dashboard' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => { setActiveSection('countries'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeSection === 'countries' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">public</span>
                <span>Countries</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${activeSection === 'countries' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {destinations.length}
              </span>
            </button>

            <button 
              onClick={() => { setActiveSection('all_tickets'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeSection === 'all_tickets' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                <span>Flight Tickets</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${activeSection === 'all_tickets' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {totalTicketsCount}
              </span>
            </button>

            <button 
              onClick={() => { setActiveSection('airlines'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeSection === 'airlines' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">airlines</span>
              <span>Airlines</span>
            </button>

            <button 
              onClick={() => { setActiveSection('users'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeSection === 'users' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Registered Users</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${activeSection === 'users' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {registeredUsers.length}
              </span>
            </button>

            <button 
              onClick={() => { setActiveSection('admins'); setSelectedDestinationForTickets(null); }} 
              className={`text-left font-bold px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeSection === 'admins' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100 dark:text-inverse-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">security</span>
              <span>Admin Roles</span>
            </button>
          </div>
        </div>

        {/* Current Admin Account Card */}
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Signed in as</p>
          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.full_name || 'Administrator'}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email}</p>
        </div>
      </aside>

      {/* ─── ADMIN MAIN WORKSPACE ─── */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">

        {/* ══════════════════════════════════════════════════════════════
            1. DASHBOARD OVERVIEW
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'dashboard' && (
          <div className="flex flex-col gap-8 max-w-6xl">
            <div>
              <h2 className="font-headline-lg-mobile font-black text-2xl sm:text-3xl text-slate-900 dark:text-secondary-fixed">
                Welcome to Aashmi Admin Hub
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Full control over country packages, ticket inventory, registered travelers, and admin permissions.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div 
                onClick={() => setActiveSection('countries')}
                className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">public</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {destinations.filter(d => d.is_active !== false).length} Active
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">{destinations.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Countries / Destinations</p>
              </div>

              <div 
                onClick={() => setActiveSection('all_tickets')}
                className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">confirmation_number</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Inventory
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">{totalTicketsCount}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Flight Tickets</p>
              </div>

              <div 
                onClick={() => setActiveSection('users')}
                className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">group</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">{registeredUsers.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Registered Users</p>
              </div>

              <div 
                onClick={() => setActiveSection('airlines')}
                className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">airlines</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    Partners
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900">{airlines.length}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Airlines Listed</p>
              </div>
            </div>

            {/* Quick Actions Cluster */}
            <div className="bg-white dark:bg-inverse-surface rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Quick Administration Tasks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => { setActiveSection('countries'); handleOpenAddDest(); }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 transition-all text-left flex items-start gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[24px]">add_circle</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Add New Country Card</h4>
                    <p className="text-xs text-slate-500">Create new country with image, price & visa</p>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSection('all_tickets'); }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 transition-all text-left flex items-start gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[24px]">edit_calendar</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Edit / Add Tickets</h4>
                    <p className="text-xs text-slate-500">Manage rates, departure times & seats</p>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSection('users'); }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 transition-all text-left flex items-start gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[24px]">manage_accounts</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Manage Users & Admins</h4>
                    <p className="text-xs text-slate-500">Assign admin role with one click</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. COUNTRIES / DESTINATIONS (ADD / EDIT / DELETE / IMAGE / ACTIVE)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'countries' && selectedDestinationForTickets && (
          <TicketsAdminView 
            destination={selectedDestinationForTickets} 
            goBack={() => setSelectedDestinationForTickets(null)} 
          />
        )}

        {activeSection === 'countries' && !selectedDestinationForTickets && (
          <div className="flex flex-col gap-6 max-w-6xl">
            {/* Header & Controls */}
            {!showDestForm ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-headline-lg font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                      <span>🌍 Country & Destination Management</span>
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Add, edit, change images, update pricing, visa info, and toggle active status on the home page.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddDest}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>➕ Add Country</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search country, city, or airport code (e.g. Dubai, DXB)..."
                      value={destSearch}
                      onChange={(e) => setDestSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={destCategoryFilter}
                    onChange={(e) => setDestCategoryFilter(e.target.value)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="INTERNATIONAL">International</option>
                    <option value="DOMESTIC">Domestic</option>
                    <option value="Flights">Flights</option>
                    <option value="Umrah">Umrah</option>
                    <option value="Visa">Visa</option>
                  </select>
                </div>

                {/* Country Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDestinations.length === 0 ? (
                    <div className="col-span-full p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                      <p className="font-bold text-base">No countries found matching search.</p>
                      <button onClick={handleOpenAddDest} className="mt-3 text-xs font-bold text-primary underline">
                        ➕ Add a new country now
                      </button>
                    </div>
                  ) : (
                    filteredDestinations.map((dest) => (
                      <div
                        key={dest.id}
                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                          dest.is_active !== false ? 'border-slate-200' : 'border-red-200 bg-red-50/20 opacity-80'
                        }`}
                      >
                        {/* Card Image Banner */}
                        <div 
                          className="h-44 relative flex flex-col justify-between p-3.5 bg-slate-800 text-white"
                          style={{
                            backgroundImage: `url(${dest.image_url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25"></div>

                          {/* Top Badges */}
                          <div className="z-10 flex justify-between items-center w-full">
                            <span className="bg-black/60 backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                              {dest.code || 'CODE'} • {dest.city}
                            </span>
                            
                            {/* Active/Inactive Toggle Badge */}
                            <button
                              onClick={() => handleToggleDestActive(dest)}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer ${
                                dest.is_active !== false
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                              title="Click to toggle Active / Inactive on website"
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {dest.is_active !== false ? 'visibility' : 'visibility_off'}
                              </span>
                              {dest.is_active !== false ? 'Active' : 'Inactive'}
                            </button>
                          </div>

                          {/* Bottom Country Title & Price */}
                          <div className="z-10">
                            <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">location_on</span>
                              {dest.landmark || dest.city}
                            </p>
                            <div className="flex justify-between items-end">
                              <h3 className="font-extrabold text-xl text-white tracking-tight">{dest.country}</h3>
                              <span className="bg-primary/95 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                                {dest.price || 'Contact'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="p-4 flex flex-col gap-2.5 flex-grow">
                          {dest.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {dest.description}
                            </p>
                          )}

                          {dest.visa_info && (
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-700">
                              <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">verified_user</span>
                              <span className="line-clamp-1">{dest.visa_info}</span>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between border-t border-slate-100 pt-2 mt-auto">
                            <span>Origin: {dest.kerala_origin || 'Kerala (CCJ)'}</span>
                            <span>{dest.category}</span>
                          </div>
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedDestinationForTickets(dest)}
                            className="flex-grow py-2 px-3 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Add or Edit flight tickets for this country"
                          >
                            <span className="material-symbols-outlined text-[16px]">airplane_ticket</span>
                            <span>Add / Edit Tickets</span>
                          </button>

                          <button
                            onClick={() => handleEditDest(dest)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-primary rounded-xl transition-colors cursor-pointer"
                            title="Edit country details"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDest(dest)}
                            className="p-2 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete this country"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* ─── ADD / EDIT COUNTRY FORM ─── */
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md relative max-w-4xl mx-auto w-full">
                <button
                  type="button"
                  onClick={() => setShowDestForm(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 material-symbols-outlined cursor-pointer"
                >
                  close
                </button>

                <h3 className="font-headline-lg font-black text-2xl text-slate-900 mb-1">
                  {editingDestId ? `✏️ Edit Country: ${destForm.country}` : '➕ Add New Country Destination'}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Fill in country details, landmarks, pricing, visa information, and photo.
                </p>

                <form onSubmit={handleDestSubmit} className="flex flex-col gap-5">
                  {/* Basic Country & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Country Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Saudi Arabia, Japan, UK"
                        value={destForm.country}
                        onChange={(e) => setDestForm({ ...destForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Primary City</label>
                      <input
                        type="text"
                        placeholder="e.g. Riyadh, Tokyo, London"
                        value={destForm.city}
                        onChange={(e) => setDestForm({ ...destForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Airport Code</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. RUH, HND, LHR"
                        value={destForm.code}
                        onChange={(e) => setDestForm({ ...destForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Landmark, Price & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Top Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Kingdom Centre, Burj Khalifa"
                        value={destForm.landmark}
                        onChange={(e) => setDestForm({ ...destForm, landmark: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Starting Price Display</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹12,200"
                        value={destForm.price}
                        onChange={(e) => setDestForm({ ...destForm, price: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Category</label>
                      <select
                        value={destForm.category}
                        onChange={(e) => setDestForm({ ...destForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="INTERNATIONAL">International</option>
                        <option value="DOMESTIC">Domestic</option>
                        <option value="Flights">Flights</option>
                        <option value="Departures">Departures</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Visa">Visa</option>
                      </select>
                    </div>
                  </div>

                  {/* Image URL & Upload */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500">
                      🖼️ Country Image (Banner)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5">Option 1: Paste Direct Image URL</p>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={destForm.image_url}
                          onChange={(e) => setDestForm({ ...destForm, image_url: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1.5">Option 2: Upload Image File</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCountryImageUpload}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                      </div>
                    </div>

                    {destForm.image_url && (
                      <div className="flex items-center gap-3 mt-2">
                        <img
                          src={destForm.image_url}
                          alt="Preview"
                          className="w-24 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Image URL attached
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief highlight of the destination (e.g. Kingdom Centre & Historic Diriyah)..."
                      value={destForm.description}
                      onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                    />
                  </div>

                  {/* Highlights & Visa Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                        Attractions & Highlights
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Key places to visit: Eiffel Tower, Louvre, Seine Cruise..."
                        value={destForm.highlights}
                        onChange={(e) => setDestForm({ ...destForm, highlights: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                        Visa Information
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Tourist eVisa available online in 48 hours. GCC residency eligible..."
                        value={destForm.visa_info}
                        onChange={(e) => setDestForm({ ...destForm, visa_info: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Kerala Origin & Active Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                        Kerala Origin Airport
                      </label>
                      <select
                        value={destForm.kerala_origin}
                        onChange={(e) => setDestForm({ ...destForm, kerala_origin: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="Kozhikode (CCJ)">Kozhikode (CCJ)</option>
                        <option value="Cochin (COK)">Cochin (COK)</option>
                        <option value="Trivandrum (TRV)">Trivandrum (TRV)</option>
                        <option value="Kannur (CNN)">Kannur (CNN)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Card Status</p>
                        <p className="text-[11px] text-slate-500">Show on public homepage</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDestForm({ ...destForm, is_active: !destForm.is_active })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          destForm.is_active
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {destForm.is_active ? '✓ ACTIVE' : '✕ INACTIVE'}
                      </button>
                    </div>
                  </div>

                  {/* Form Submit & Cancel */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDestForm(false)}
                      className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Saving...' : (editingDestId ? 'UPDATE COUNTRY' : 'SAVE COUNTRY')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. FLIGHT TICKETS (ALL TICKETS TABLE WITH EDIT)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'all_tickets' && (
          <AllTicketsAdminView />
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. AIRLINES MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'airlines' && (
          <div className="max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-headline-lg-mobile font-bold text-slate-900 text-xl mb-1">
              Add Airline Partner
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Add airlines that appear in the ticket creator and partner list.
            </p>

            <form onSubmit={handleAirlineSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Airline Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Saudia, Emirates, Air India Express, Qatar Airways"
                  value={airlineData.name}
                  onChange={(e) => setAirlineData({ ...airlineData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Airline Logo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={airlineData.logo_url}
                  onChange={(e) => setAirlineData({ ...airlineData, logo_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                />
              </div>

              {airlineData.logo_url && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img src={airlineData.logo_url} alt="Logo" className="h-10 object-contain" />
                  <span className="text-xs text-slate-600 font-bold">Logo Preview</span>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="mt-2 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'SAVE AIRLINE PARTNER'}
              </button>
            </form>

            {airlines.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Current Airlines ({airlines.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {airlines.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {a.logo_url && <img src={a.logo_url} alt={a.name} className="h-4 object-contain" />}
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5. REGISTERED USERS (FULL DETAILS & 1-CLICK ADMIN TOGGLE)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'users' && (
          <div className="flex flex-col gap-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-headline-lg font-black text-2xl text-slate-900 flex items-center gap-2">
                  <span>👥 Registered Users ({registeredUsers.length})</span>
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Complete user profiles: Names, email, mobile, address, city, state, country, PIN code, and admin privileges.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search user name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Address / City</th>
                      <th className="py-3.5 px-4">Registered Date</th>
                      <th className="py-3.5 px-4 text-center">Admin Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No registered users found. Users who register on the site will appear here with full details.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => {
                        const isUserAdmin = checkIsAdmin(u.email);
                        return (
                          <tr key={u.id || i} className="hover:bg-slate-50/80 transition-colors">
                            {/* User Column */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 uppercase">
                                  {u.first_name ? u.first_name[0] : (u.full_name ? u.full_name[0] : 'U')}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">
                                    {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Traveler'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact Column */}
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-800">{u.phone || '--'}</p>
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                                ✓ Verified
                              </span>
                            </td>

                            {/* Address Column */}
                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="font-medium truncate max-w-[180px]" title={u.address}>
                                {u.address || 'Address not given'}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {[u.city, u.state, u.pin_code].filter(Boolean).join(', ') || u.country || 'India'}
                              </p>
                            </td>

                            {/* Date Column */}
                            <td className="py-3.5 px-4 text-slate-500">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                            </td>

                            {/* Admin Status Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {isUserAdmin ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                  👑 Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Member
                                </span>
                              )}
                            </td>

                            {/* Actions Column: Full Detail & 1-Click Admin Toggle */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="View full user details"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>

                                <button
                                  onClick={() => handleToggleAdminRole(u.email)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    isUserAdmin
                                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                                  }`}
                                  title={isUserAdmin ? "Revoke admin rights" : "Promote user to Admin"}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isUserAdmin ? 'person_remove' : 'admin_panel_settings'}
                                  </span>
                                  <span>{isUserAdmin ? 'Remove' : 'Make Admin'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full User Details Modal */}
            {selectedUserDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 relative animate-fadeIn">
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 material-symbols-outlined cursor-pointer"
                  >
                    close
                  </button>

                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg uppercase">
                      {selectedUserDetail.first_name ? selectedUserDetail.first_name[0] : 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedUserDetail.full_name || 'User Profile'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">{selectedUserDetail.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedUserDetail.phone || '--'}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Admin Privileges</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {checkIsAdmin(selectedUserDetail.email) ? '👑 Admin' : 'Standard Member'}
                      </p>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Address</p>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {selectedUserDetail.address || 'Not specified'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">City / State</p>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {[selectedUserDetail.city, selectedUserDetail.state].filter(Boolean).join(', ') || '--'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Country & PIN</p>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {selectedUserDetail.country || 'India'} - {selectedUserDetail.pin_code || '--'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleAdminRole(selectedUserDetail.email)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        checkIsAdmin(selectedUserDetail.email)
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-500 text-white shadow-xs'
                      }`}
                    >
                      {checkIsAdmin(selectedUserDetail.email) ? 'Revoke Admin' : '👑 Make Admin'}
                    </button>
                    <button
                      onClick={() => setSelectedUserDetail(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            6. ADMIN ROLES MANAGEMENT (ONE-CLICK SETTINGS)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === 'admins' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div>
              <h2 className="font-headline-lg font-black text-2xl text-slate-900 flex items-center gap-2">
                <span>👑 Admin Access & Permission Controls</span>
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Only active administrators can access this portal (/admin). Promote any user or enter an email to grant admin rights in 1 click.
              </p>
            </div>

            {/* Quick Add Admin by Email */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
                Grant Admin by Email
              </h3>
              <form onSubmit={handleAddAdminByEmail} className="flex gap-2">
                <input
                  required
                  type="email"
                  placeholder="Enter email address (e.g. colleague@travels.com)..."
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-grow px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Set as Admin 👑
                </button>
              </form>
            </div>

            {/* Current Administrators List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">verified_user</span>
                Active Administrators
              </h3>

              <div className="flex flex-col divide-y divide-slate-100">
                {/* Super-admin row */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">farseen.travels@gmail.com</p>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                        Super Administrator (Permanent)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold italic">Protected</span>
                </div>

                {/* Other admins */}
                {registeredUsers.filter(u => checkIsAdmin(u.email) && u.email?.toLowerCase() !== 'farseen.travels@gmail.com').map((adm, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {adm.first_name ? adm.first_name[0] : 'A'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{adm.full_name || adm.email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAdminRole(adm.email)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove Admin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
