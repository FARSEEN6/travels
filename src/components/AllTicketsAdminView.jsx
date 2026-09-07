import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAirlineAssets, COMMON_AIRLINES_LIST } from '../utils/airlineAssets';

const AllTicketsAdminView = () => {
  const [tickets, setTickets] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '', airline: '', airline_logo_url: '', flight_img_url: '', from_city: '', from_code: '',
    departure_time: '', to_city: '', to_code: '', arrival_time: '',
    available_seats: 1, price: '', luggage: ''
  });

  // Add Ticket State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    destination_id: '',
    date: new Date().toISOString().split('T')[0],
    airline: 'Saudia',
    airline_logo_url: getAirlineAssets('Saudia').logo,
    flight_img_url: getAirlineAssets('Saudia').flight_img,
    from_city: 'Kozhikode', from_code: 'CCJ', departure_time: '08:30',
    to_city: '', to_code: '', arrival_time: '11:15',
    available_seats: 9, price: '₹ 14,500', luggage: '30kg + 7kg'
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('id, country, city, code').order('country');
    if (data && data.length > 0) {
      setDestinations(data);
    } else {
      try {
        const local = localStorage.getItem('aashmi_destinations');
        if (local) setDestinations(JSON.parse(local));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        destination:destinations (
          country,
          city,
          code
        )
      `)
      .order('created_at', { ascending: false });
      
    if (data) setTickets(data);
    if (error && error.code !== '42P01') console.error(error);
    setLoading(false);
  };

  // ─── AIRLINE AUTO MATCHING ───
  const handleAirlineChangeForNew = (airlineName) => {
    const assets = getAirlineAssets(airlineName);
    setNewTicket(prev => ({
      ...prev,
      airline: airlineName,
      airline_logo_url: assets.logo,
      flight_img_url: assets.flight_img
    }));
  };

  const handleAirlineChangeForEdit = (airlineName) => {
    const assets = getAirlineAssets(airlineName);
    setEditForm(prev => ({
      ...prev,
      airline: airlineName,
      airline_logo_url: assets.logo,
      flight_img_url: assets.flight_img
    }));
  };

  // ─── ADD NEW TICKET ───
  const handleDestinationChangeForAdd = (destId) => {
    const found = destinations.find(d => d.id === destId);
    setNewTicket({
      ...newTicket,
      destination_id: destId,
      to_city: found?.city || '',
      to_code: found?.code || ''
    });
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.destination_id) {
      alert("Please select a destination country!");
      return;
    }
    setSaveLoading(true);
    try {
      const assets = getAirlineAssets(newTicket.airline);
      const payload = {
        ...newTicket,
        airline_logo_url: newTicket.airline_logo_url || assets.logo
      };

      const { error } = await supabase.from('tickets').insert([payload]);
      if (error) throw error;
      alert("Flight Ticket created successfully!");
      setShowAddModal(false);
      fetchTickets();
      // Reset
      setNewTicket({
        destination_id: '',
        date: new Date().toISOString().split('T')[0],
        airline: 'Saudia',
        airline_logo_url: getAirlineAssets('Saudia').logo,
        flight_img_url: getAirlineAssets('Saudia').flight_img,
        from_city: 'Kozhikode', from_code: 'CCJ', departure_time: '08:30',
        to_city: '', to_code: '', arrival_time: '11:15',
        available_seats: 9, price: '₹ 14,500', luggage: '30kg + 7kg'
      });
    } catch (err) {
      alert("Error adding ticket: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // ─── EDIT TICKET ───
  const handleStartEdit = (ticket) => {
    const assets = getAirlineAssets(ticket.airline);
    setEditingTicket(ticket);
    setEditForm({
      date: ticket.date || '',
      airline: ticket.airline || '',
      airline_logo_url: ticket.airline_logo_url || assets.logo,
      flight_img_url: ticket.flight_img_url || assets.flight_img,
      from_city: ticket.from_city || '',
      from_code: ticket.from_code || '',
      departure_time: ticket.departure_time || '',
      to_city: ticket.to_city || '',
      to_code: ticket.to_code || '',
      arrival_time: ticket.arrival_time || '',
      available_seats: ticket.available_seats || 1,
      price: ticket.price || '',
      luggage: ticket.luggage || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setSaveLoading(true);
    try {
      const assets = getAirlineAssets(editForm.airline);
      const payload = {
        ...editForm,
        airline_logo_url: editForm.airline_logo_url || assets.logo
      };

      const { error } = await supabase
        .from('tickets')
        .update(payload)
        .eq('id', editingTicket.id);

      if (error) throw error;
      alert("Ticket updated successfully!");
      setEditingTicket(null);
      fetchTickets();
    } catch (err) {
      alert("Error updating ticket: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // ─── DELETE TICKET ───
  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTickets();
  };

  return (
    <div className="w-full bg-white dark:bg-inverse-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-outline flex flex-col min-h-[650px]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-headline-lg font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎫 Flight Tickets Management</span>
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Add new flight tickets, edit existing tickets, or remove expired fares. Total: {tickets.length} tickets.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchTickets}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-grow sm:flex-grow-0 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>➕ ADD NEW TICKET</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-slate-400 font-bold tracking-widest text-xs animate-pulse">LOADING TICKETS...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
              <p className="font-bold text-base mb-1">No tickets added yet.</p>
              <p className="text-xs mb-4">Click the button below to add your first flight ticket.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add First Ticket</span>
              </button>
            </div>
          ) : (
            tickets.map((ticket) => {
              const assets = getAirlineAssets(ticket.airline);
              const logoUrl = ticket.airline_logo_url || assets.logo;
              const aircraftImg = assets.flight_img;

              return (
                <div key={ticket.id} className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-5 pr-20">
                    
                    {/* Aircraft Photo Thumbnail & Airline */}
                    <div className="flex items-center gap-3 min-w-[170px]">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 shadow-xs">
                        <img 
                          src={aircraftImg} 
                          alt={ticket.airline} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/airlines/indigo.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-black/25"></div>
                        {logoUrl && (
                          <img 
                            src={logoUrl} 
                            alt={ticket.airline} 
                            className="absolute bottom-1 right-1 w-6 h-6 object-contain bg-white/90 p-0.5 rounded-full shadow-sm" 
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm leading-tight">{ticket.airline || 'Airline'}</span>
                        <span className="text-[10px] font-extrabold text-primary uppercase">
                          {ticket.destination?.country || 'Destination'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {ticket.date ? new Date(ticket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible'}
                        </span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-4 flex-grow min-w-[220px] justify-center bg-white px-4 py-2.5 rounded-xl border border-slate-200/80">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{ticket.from_city}</p>
                        <p className="text-base font-black text-slate-800">{ticket.from_code}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{ticket.departure_time}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[20px]">flight_takeoff</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{ticket.to_city}</p>
                        <p className="text-base font-black text-slate-800">{ticket.to_code}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{ticket.arrival_time}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col min-w-[80px] items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Seats</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {ticket.available_seats} Left
                      </span>
                    </div>
                    
                    <div className="flex flex-col min-w-[110px] items-end">
                      <span className="text-lg font-black text-primary">{ticket.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">luggage</span> {ticket.luggage}
                      </span>
                    </div>

                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button 
                      onClick={() => handleStartEdit(ticket)} 
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-primary rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold" 
                      title="Edit Ticket"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)} 
                      className="p-2 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-xl transition-colors cursor-pointer shadow-xs" 
                      title="Delete Ticket"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ➕ ADD TICKET MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-inverse-surface rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 my-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-lg font-black text-2xl text-slate-900">
                  ➕ Add New Flight Ticket
                </h3>
                <p className="text-xs text-slate-500">
                  Choose destination and airline name: <b>Logo and Aircraft photo</b> are automatically attached!
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-700 material-symbols-outlined cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
              {/* Destination Dropdown */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                  Destination Country *
                </label>
                <select
                  required
                  value={newTicket.destination_id}
                  onChange={(e) => handleDestinationChangeForAdd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">-- Choose Country / Destination --</option>
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.country} — {d.city} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Airline (with Auto-Detect) & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                    Airline Name (Auto-Logo & Photo) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Saudia, Emirates, IndiGo..."
                    value={newTicket.airline}
                    onChange={(e) => handleAirlineChangeForNew(e.target.value)}
                    list="airline-suggestions-add"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:border-primary outline-none"
                  />
                  <datalist id="airline-suggestions-add">
                    {COMMON_AIRLINES_LIST.map((a, i) => (
                      <option key={i} value={a} />
                    ))}
                  </datalist>

                  {/* Auto-detected Airline Preview */}
                  {newTicket.airline && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-10 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img 
                          src={newTicket.flight_img_url || getAirlineAssets(newTicket.airline).flight_img} 
                          alt="Aircraft" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = '/airlines/indigo.jpg'; }}
                        />
                      </div>
                      <img 
                        src={newTicket.airline_logo_url || getAirlineAssets(newTicket.airline).logo} 
                        alt="Logo" 
                        className="w-5 h-5 object-contain" 
                      />
                      <span className="text-[11px] font-bold text-emerald-600">
                        Auto Logo & Photo Attached
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Date *</label>
                  <input 
                    required 
                    type="date" 
                    value={newTicket.date} 
                    onChange={(e) => setNewTicket({...newTicket, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Route: Departure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From City</label>
                  <input 
                    required
                    type="text" 
                    value={newTicket.from_city} 
                    onChange={(e) => setNewTicket({...newTicket, from_city: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From Code</label>
                  <input 
                    required
                    type="text" 
                    maxLength={4}
                    value={newTicket.from_code} 
                    onChange={(e) => setNewTicket({...newTicket, from_code: e.target.value.toUpperCase()})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Dep Time</label>
                  <input 
                    required
                    type="text" 
                    placeholder="08:30"
                    value={newTicket.departure_time} 
                    onChange={(e) => setNewTicket({...newTicket, departure_time: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Route: Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To City</label>
                  <input 
                    required
                    type="text" 
                    value={newTicket.to_city} 
                    onChange={(e) => setNewTicket({...newTicket, to_city: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To Code</label>
                  <input 
                    required
                    type="text" 
                    maxLength={4}
                    value={newTicket.to_code} 
                    onChange={(e) => setNewTicket({...newTicket, to_code: e.target.value.toUpperCase()})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Arr Time</label>
                  <input 
                    required
                    type="text" 
                    placeholder="11:45"
                    value={newTicket.arrival_time} 
                    onChange={(e) => setNewTicket({...newTicket, arrival_time: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Seats, Price, Luggage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Seats</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={newTicket.available_seats} 
                    onChange={(e) => setNewTicket({...newTicket, available_seats: parseInt(e.target.value) || 1})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Price *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="₹ 14,500"
                    value={newTicket.price} 
                    onChange={(e) => setNewTicket({...newTicket, price: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Luggage</label>
                  <input 
                    type="text" 
                    placeholder="30kg + 7kg"
                    value={newTicket.luggage} 
                    onChange={(e) => setNewTicket({...newTicket, luggage: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  disabled={saveLoading} 
                  type="submit" 
                  className="px-7 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saveLoading ? 'Saving...' : 'SAVE TICKET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ✏️ EDIT TICKET MODAL
      ══════════════════════════════════════════════════════════════ */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-inverse-surface rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 my-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-lg font-black text-2xl text-slate-900">
                  ✏️ Edit Flight Ticket
                </h3>
                <p className="text-xs text-slate-500">
                  {editingTicket.destination?.country} • {editingTicket.from_city} ({editingTicket.from_code}) → {editingTicket.to_city} ({editingTicket.to_code})
                </p>
              </div>
              <button 
                onClick={() => setEditingTicket(null)} 
                className="text-slate-400 hover:text-slate-700 material-symbols-outlined cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                    Airline (Auto Logo & Photo)
                  </label>
                  <input 
                    type="text" 
                    value={editForm.airline} 
                    onChange={(e) => handleAirlineChangeForEdit(e.target.value)} 
                    list="airline-suggestions-edit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none"
                  />
                  <datalist id="airline-suggestions-edit">
                    {COMMON_AIRLINES_LIST.map((a, i) => (
                      <option key={i} value={a} />
                    ))}
                  </datalist>

                  {editForm.airline && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <div className="w-10 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img 
                          src={editForm.flight_img_url || getAirlineAssets(editForm.airline).flight_img} 
                          alt="Aircraft" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = '/airlines/indigo.jpg'; }}
                        />
                      </div>
                      <img 
                        src={editForm.airline_logo_url || getAirlineAssets(editForm.airline).logo} 
                        alt="Logo" 
                        className="w-5 h-5 object-contain" 
                      />
                      <span className="text-[11px] font-bold text-emerald-600">
                        Auto Attached
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Flight Date</label>
                  <input 
                    required 
                    type="date" 
                    value={editForm.date} 
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From City</label>
                  <input 
                    type="text" 
                    value={editForm.from_city} 
                    onChange={(e) => setEditForm({...editForm, from_city: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From Code</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={editForm.from_code} 
                    onChange={(e) => setEditForm({...editForm, from_code: e.target.value.toUpperCase()})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Dep Time</label>
                  <input 
                    type="text" 
                    value={editForm.departure_time} 
                    onChange={(e) => setEditForm({...editForm, departure_time: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To City</label>
                  <input 
                    type="text" 
                    value={editForm.to_city} 
                    onChange={(e) => setEditForm({...editForm, to_city: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To Code</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={editForm.to_code} 
                    onChange={(e) => setEditForm({...editForm, to_code: e.target.value.toUpperCase()})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Arr Time</label>
                  <input 
                    type="text" 
                    value={editForm.arrival_time} 
                    onChange={(e) => setEditForm({...editForm, arrival_time: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Available Seats</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editForm.available_seats} 
                    onChange={(e) => setEditForm({...editForm, available_seats: parseInt(e.target.value) || 0})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Price</label>
                  <input 
                    type="text" 
                    value={editForm.price} 
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Luggage</label>
                  <input 
                    type="text" 
                    value={editForm.luggage} 
                    onChange={(e) => setEditForm({...editForm, luggage: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingTicket(null)} 
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  disabled={saveLoading} 
                  type="submit" 
                  className="px-7 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTicketsAdminView;
