import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAirlineAssets, COMMON_AIRLINES_LIST } from '../utils/airlineAssets';

const TicketsAdminView = ({ destination, goBack }) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    date: '', airline: '', airline_logo_url: '', flight_img_url: '', from_city: '', from_code: '',
    departure_time: '', to_city: '', to_code: '', arrival_time: '',
    available_seats: 9, price: '', luggage: '30kg + 7kg'
  });

  useEffect(() => {
    fetchTickets();
  }, [destination]);

  const resolveDestinationId = async () => {
    if (destination?.id && destination.id.length > 25 && !destination.id.startsWith('seed-')) {
      return destination.id;
    }
    try {
      const { data } = await supabase.from('destinations').select('id').eq('code', destination.code).limit(1);
      if (data && data[0]?.id) return data[0].id;
    } catch (e) {
      console.warn(e);
    }
    return destination.id;
  };

  const fetchTickets = async () => {
    setLoading(true);
    const destId = await resolveDestinationId();
    const { data, error } = await supabase.from('tickets').select('*').eq('destination_id', destId).order('created_at', { ascending: false });
    if (data) setTicketsData(data);
    if (error && error.code !== '42P01') console.error(error); 
    setLoading(false);
  };

  const handleAirlineChange = (airlineName) => {
    const assets = getAirlineAssets(airlineName);
    setNewTicketData(prev => ({
      ...prev,
      airline: airlineName,
      airline_logo_url: assets.logo,
      flight_img_url: assets.flight_img
    }));
  };

  const handleOpenAdd = () => {
    const defaultOrigin = destination.kerala_origin || destination.keralaOrigin || 'Kozhikode (CCJ)';
    const originCode = defaultOrigin.match(/\(([A-Z]{3})\)/)?.[1] || 'CCJ';
    const originCity = defaultOrigin.split(' ')[0] || 'Kozhikode';

    setNewTicketData({
      date: new Date().toISOString().split('T')[0],
      airline: 'Saudia',
      airline_logo_url: getAirlineAssets('Saudia').logo,
      flight_img_url: getAirlineAssets('Saudia').flight_img,
      from_city: originCity,
      from_code: originCode,
      departure_time: '08:30',
      to_city: destination.city,
      to_code: destination.code,
      arrival_time: '11:15',
      available_seats: 9,
      price: destination.price || '₹ 14,500',
      luggage: '30kg + 7kg'
    });
    setEditingTicketId(null);
    setShowTicketForm(true);
  };

  const handleEditTicket = (ticket) => {
    const assets = getAirlineAssets(ticket.airline);
    setNewTicketData({
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
    setEditingTicketId(ticket.id);
    setShowTicketForm(true);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const destId = await resolveDestinationId();
      // Ensure airline logo is automatically attached if missing
      const assets = getAirlineAssets(newTicketData.airline);
      const finalData = { 
        ...newTicketData, 
        destination_id: destId,
        airline_logo_url: newTicketData.airline_logo_url || assets.logo
      };

      if (editingTicketId) {
        const { error } = await supabase.from('tickets').update(finalData).eq('id', editingTicketId);
        if (error) throw error;
        alert("Ticket updated successfully!");
      } else {
        const { error } = await supabase.from('tickets').insert([finalData]);
        if (error) throw error;
        alert("Ticket created successfully!");
      }
      setShowTicketForm(false);
      setEditingTicketId(null);
      fetchTickets();
    } catch (error) {
      alert("Error saving ticket: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTickets();
  };

  const handleCancelForm = () => {
    setShowTicketForm(false);
    setEditingTicketId(null);
  };

  return (
    <div className="w-full bg-white dark:bg-inverse-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-outline flex flex-col min-h-[600px]">
      
      {!showTicketForm ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-slate-100">
            <div>
              <button onClick={goBack} className="text-secondary font-bold text-xs flex items-center gap-1 hover:underline mb-2 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> BACK TO COUNTRIES
              </button>
              <h3 className="font-headline-lg font-black text-2xl text-primary dark:text-secondary-fixed">
                Tickets for {destination.country} ({destination.city} • {destination.code})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All flight tickets currently available for {destination.country}. Click Edit to change times, seats, airline, or fare.
              </p>
            </div>
            <button 
              onClick={handleOpenAdd}
              className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>➕ ADD TICKET</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
            {ticketsData.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
                <p className="font-bold text-base mb-1">No tickets found for {destination.country}.</p>
                <p className="text-xs mb-4">Click below to add the first flight ticket for this country.</p>
                <button
                  onClick={handleOpenAdd}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Ticket Now</span>
                </button>
              </div>
            ) : (
              ticketsData.map(ticket => {
                const assets = getAirlineAssets(ticket.airline);
                const logoUrl = ticket.airline_logo_url || assets.logo;
                const aircraftImg = assets.flight_img;

                return (
                  <div key={ticket.id} className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5 bg-slate-50 relative hover:shadow-md transition-shadow">
                    
                    {/* Airline & Aircraft Photo Thumbnail */}
                    <div className="flex items-center gap-3 min-w-[170px] w-full md:w-auto">
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
                        <span className="font-black text-slate-900 text-sm leading-tight">{ticket.airline}</span>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {ticket.date ? new Date(ticket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible'}
                        </span>
                      </div>
                    </div>

                    {/* From -> To Route section */}
                    <div className="flex items-center gap-4 flex-grow justify-center bg-white px-5 py-2.5 rounded-xl border border-slate-200/80 w-full md:w-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{ticket.from_city}</span>
                        <span className="font-black text-slate-900 text-base leading-tight">{ticket.from_code}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">{ticket.departure_time}</span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                      </div>

                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{ticket.to_city}</span>
                        <span className="font-black text-slate-900 text-base leading-tight">{ticket.to_code}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">{ticket.arrival_time}</span>
                      </div>
                    </div>

                    {/* Available Seats */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Seats</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5">
                        {ticket.available_seats} Left
                      </span>
                    </div>

                    {/* Price & Luggage */}
                    <div className="flex flex-col items-end min-w-[120px] gap-1 border-l border-slate-200 pl-4">
                      <span className="font-black text-xl text-primary">{ticket.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">luggage</span> {ticket.luggage}
                      </span>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                      <button 
                        onClick={() => handleEditTicket(ticket)} 
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-primary rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold" 
                        title="Edit this ticket"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTicket(ticket.id)} 
                        className="p-2 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-xl transition-colors cursor-pointer shadow-xs" 
                        title="Delete this ticket"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* ══════════════════════════════════════════════════════════════
            ADD / EDIT FORM (WITH AUTO AIRLINE LOGO & PHOTO)
        ══════════════════════════════════════════════════════════════ */
        <div className="w-full max-w-3xl mx-auto relative bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md animate-fadeIn">
          <button type="button" onClick={handleCancelForm} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 material-symbols-outlined cursor-pointer">
            close
          </button>
          
          <h3 className="font-headline-lg font-black text-2xl text-slate-900 mb-1">
            {editingTicketId ? `✏️ Edit Ticket - ${destination.country}` : `➕ Add Ticket - ${destination.country}`}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Type or select the airline name below: its <b>official logo and aircraft photo</b> will automatically attach!
          </p>
          
          <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
            {/* ROW 1: Airline (with auto-detect) & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                  Airline Name (Auto-Logo & Auto-Photo) *
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Saudia, Emirates, IndiGo, Qatar Airways..."
                  value={newTicketData.airline} 
                  onChange={(e) => handleAirlineChange(e.target.value)} 
                  list="airline-suggestions-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:border-primary outline-none"
                />
                <datalist id="airline-suggestions-list">
                  {COMMON_AIRLINES_LIST.map((a, i) => (
                    <option key={i} value={a} />
                  ))}
                </datalist>

                {/* Auto-detected Airline Preview */}
                {newTicketData.airline && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img 
                        src={newTicketData.flight_img_url || getAirlineAssets(newTicketData.airline).flight_img} 
                        alt="Aircraft" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.src = '/airlines/indigo.jpg'; }}
                      />
                    </div>
                    <img 
                      src={newTicketData.airline_logo_url || getAirlineAssets(newTicketData.airline).logo} 
                      alt="Logo" 
                      className="w-6 h-6 object-contain" 
                    />
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Auto Logo & Aircraft Attached
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Flight Date *</label>
                <input 
                  required 
                  type="date" 
                  value={newTicketData.date} 
                  onChange={(e) => setNewTicketData({...newTicketData, date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* ROW 2: Departure details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From City</label>
                <input required type="text" value={newTicketData.from_city} onChange={(e) => setNewTicketData({...newTicketData, from_city: e.target.value})} placeholder="e.g. Kozhikode" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">From Airport Code</label>
                <input required type="text" value={newTicketData.from_code} onChange={(e) => setNewTicketData({...newTicketData, from_code: e.target.value.toUpperCase()})} placeholder="e.g. CCJ" maxLength={4} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Departure Time</label>
                <input required type="text" value={newTicketData.departure_time} onChange={(e) => setNewTicketData({...newTicketData, departure_time: e.target.value})} placeholder="08:30" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"/>
              </div>
            </div>

            {/* ROW 3: Arrival details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To City</label>
                <input required type="text" value={newTicketData.to_city} onChange={(e) => setNewTicketData({...newTicketData, to_city: e.target.value})} placeholder="e.g. Riyadh" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">To Airport Code</label>
                <input required type="text" value={newTicketData.to_code} onChange={(e) => setNewTicketData({...newTicketData, to_code: e.target.value.toUpperCase()})} placeholder="e.g. RUH" maxLength={4} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm uppercase font-mono outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Arrival Time</label>
                <input required type="text" value={newTicketData.arrival_time} onChange={(e) => setNewTicketData({...newTicketData, arrival_time: e.target.value})} placeholder="11:15" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none"/>
              </div>
            </div>

            {/* ROW 4: Seats, Price, Luggage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Available Seats</label>
                <input required type="number" min="1" value={newTicketData.available_seats} onChange={(e) => setNewTicketData({...newTicketData, available_seats: parseInt(e.target.value) || 1})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Price *</label>
                <input required type="text" value={newTicketData.price} onChange={(e) => setNewTicketData({...newTicketData, price: e.target.value})} placeholder="e.g. ₹ 14,200" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Luggage</label>
                <input required type="text" value={newTicketData.luggage} onChange={(e) => setNewTicketData({...newTicketData, luggage: e.target.value})} placeholder="e.g. 30kg + 7kg" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none"/>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button 
                type="button" 
                onClick={handleCancelForm} 
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={loading} 
                type="submit" 
                className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : (editingTicketId ? 'UPDATE TICKET' : 'SAVE TICKET')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketsAdminView;
