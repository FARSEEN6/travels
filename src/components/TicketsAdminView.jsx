import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TicketsAdminView = ({ destination, goBack }) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    date: '', airline: '', airline_logo_url: '', from_city: '', from_code: '',
    departure_time: '', to_city: '', to_code: '', arrival_time: '',
    available_seats: 1, price: '', luggage: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchAirlines();
  }, [destination]);

  const fetchAirlines = async () => {
    const { data, error } = await supabase.from('airline_partners').select('name, logo_url');
    if (error) console.error("Error fetching airlines:", error);
    if (data) setAirlines(data);
  };

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tickets').select('*').eq('destination_id', destination.id).order('created_at', { ascending: false });
    if (data) setTicketsData(data);
    if (error && error.code !== '42P01') console.error(error); 
    setLoading(false);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const finalData = { ...newTicketData, destination_id: destination.id };
        const { error } = await supabase.from('tickets').insert([finalData]);
        if (error) throw error;
        alert("Ticket saved successfully!");
        setShowTicketForm(false);
        fetchTickets();
        setNewTicketData({
            date: '', airline: '', airline_logo_url: '', from_city: '', from_code: '',
            departure_time: '', to_city: '', to_code: '', arrival_time: '',
            available_seats: 1, price: '', luggage: ''
        });
    } catch (error) {
        alert("Error saving ticket: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTickets();
  };

  return (
    <div className="w-full bg-white dark:bg-inverse-surface p-8 rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30 flex flex-col min-h-[600px]">
      
      {!showTicketForm ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <button onClick={goBack} className="text-secondary font-bold text-label-caps flex items-center gap-1 hover:underline mb-2">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> BACK TO DESTINATIONS
              </button>
              <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed">Tickets to {destination.country}</h3>
            </div>
            <button 
              onClick={() => setShowTicketForm(true)}
              className="bg-primary dark:bg-secondary text-white dark:text-on-secondary px-6 py-3.5 rounded-xl font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined">add</span> ADD TICKET
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
            {ticketsData.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">No tickets found for this destination.</p>
            ) : (
              ticketsData.map(ticket => (
                <div key={ticket.id} className="border border-outline-variant/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 bg-surface-container-lowest relative hover:shadow-md transition-shadow">
                  {/* Date section */}
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-[28px] font-bold text-primary dark:text-white leading-none">{new Date(ticket.date).getDate() || '--'}</span>
                    <span className="text-[14px] font-bold text-outline uppercase">{ticket.date ? new Date(ticket.date).toLocaleString('default', { month: 'short' }) : '--'}</span>
                    <span className="text-[10px] text-outline">{ticket.date ? new Date(ticket.date).getFullYear() : '--'}</span>
                  </div>

                  {/* Airline section */}
                  <div className="min-w-[120px] flex justify-center">
                    {ticket.airline_logo_url ? (
                        <img src={ticket.airline_logo_url} alt={ticket.airline} className="h-10 object-contain" />
                    ) : (
                        <span className="font-bold text-primary dark:text-white text-lg">{ticket.airline}</span>
                    )}
                  </div>

                  {/* From -> To section */}
                  <div className="flex items-center gap-4 flex-grow justify-center">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-outline uppercase">From</span>
                      <span className="font-bold text-primary dark:text-white text-[16px] leading-tight">{ticket.from_city}</span>
                      <span className="text-[10px] text-outline-variant">{ticket.from_code}</span>
                      <span className="text-[10px] text-outline mt-1">Dep- {ticket.departure_time}</span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-surface-container-highest dark:bg-primary-container flex items-center justify-center text-primary dark:text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>

                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-outline uppercase">To</span>
                      <span className="font-bold text-primary dark:text-white text-[16px] leading-tight">{ticket.to_city}</span>
                      <span className="text-[10px] text-outline-variant">{ticket.to_code}</span>
                      <span className="text-[10px] text-outline mt-1">Arr- {ticket.arrival_time}</span>
                    </div>
                  </div>

                  {/* Available Seats */}
                  <div className="flex flex-col items-center min-w-[80px]">
                     <span className="text-[10px] text-outline uppercase">Available Seats</span>
                     <span className="font-bold text-[22px] text-primary dark:text-white">{ticket.available_seats}</span>
                  </div>

                  {/* Price & Book */}
                  <div className="flex flex-col items-end min-w-[120px] gap-2 border-l border-outline-variant/50 pl-6 ml-auto">
                    <span className="font-bold text-[24px] text-primary dark:text-white">{ticket.price}</span>
                    <button className="bg-surface-container-highest text-primary px-4 py-2 rounded font-bold text-[12px] opacity-50 cursor-not-allowed">Book Now</button>
                    <span className="text-[10px] text-outline font-medium">Luggage - {ticket.luggage}</span>
                  </div>

                  {/* Delete button (absolute top right for admin) */}
                  <button onClick={() => handleDeleteTicket(ticket.id)} className="absolute top-2 right-2 material-symbols-outlined text-[18px] text-error hover:bg-error/10 p-1.5 rounded-full transition-colors" title="Delete Ticket">
                    delete
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-4xl mx-auto relative">
          <button type="button" onClick={() => setShowTicketForm(false)} className="absolute top-0 right-0 text-error text-label-caps font-bold hover:underline z-10">
            Cancel
          </button>
          
          <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-2">
            Add New Ticket - {destination.country}
          </h3>
          <p className="text-body-sm text-outline dark:text-outline-variant mb-8">
            Fill in the details for the new ticket to {destination.country}.
          </p>
          
          <form onSubmit={handleTicketSubmit} className="flex flex-col gap-5">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Date</label>
                  <input required type="date" value={newTicketData.date} onChange={(e) => setNewTicketData({...newTicketData, date: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Airline Name</label>
                  <select 
                    required 
                    value={newTicketData.airline} 
                    onChange={(e) => {
                      const selectedAirlineName = e.target.value;
                      const selectedAirline = airlines.find(a => a.name === selectedAirlineName);
                      setNewTicketData({
                        ...newTicketData, 
                        airline: selectedAirlineName,
                        airline_logo_url: selectedAirline ? (selectedAirline.logo_url || '') : ''
                      });
                    }} 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"
                  >
                    <option value="" disabled>Select Airline</option>
                    {airlines.map((airline, idx) => (
                      <option key={idx} value={airline.name}>{airline.name}</option>
                    ))}
                  </select>
              </div>
            </div>

            {/* ROW 2: Departure */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">From City</label>
                  <input required type="text" value={newTicketData.from_city} onChange={(e) => setNewTicketData({...newTicketData, from_city: e.target.value})} placeholder="e.g. LUCKNOW" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">From Airport Code</label>
                  <input required type="text" value={newTicketData.from_code} onChange={(e) => setNewTicketData({...newTicketData, from_code: e.target.value.toUpperCase()})} placeholder="e.g. LKO" maxLength={3} className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all uppercase"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Departure Time</label>
                  <input required type="text" value={newTicketData.departure_time} onChange={(e) => setNewTicketData({...newTicketData, departure_time: e.target.value})} placeholder="e.g. 08:30" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
            </div>

            {/* ROW 3: Arrival */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">To City</label>
                  <input required type="text" value={newTicketData.to_city} onChange={(e) => setNewTicketData({...newTicketData, to_city: e.target.value})} placeholder="e.g. RIYADH" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">To Airport Code</label>
                  <input required type="text" value={newTicketData.to_code} onChange={(e) => setNewTicketData({...newTicketData, to_code: e.target.value.toUpperCase()})} placeholder="e.g. RUH" maxLength={3} className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all uppercase"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Arrival Time</label>
                  <input required type="text" value={newTicketData.arrival_time} onChange={(e) => setNewTicketData({...newTicketData, arrival_time: e.target.value})} placeholder="e.g. 11:15" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
            </div>

            {/* ROW 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Available Seats</label>
                  <input required type="number" min="0" value={newTicketData.available_seats} onChange={(e) => setNewTicketData({...newTicketData, available_seats: parseInt(e.target.value)})} className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Price</label>
                  <input required type="text" value={newTicketData.price} onChange={(e) => setNewTicketData({...newTicketData, price: e.target.value})} placeholder="e.g. ₹ 28991" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
              <div>
                  <label className="block text-[10px] font-bold tracking-widest text-outline uppercase mb-1.5">Luggage Details</label>
                  <input required type="text" value={newTicketData.luggage} onChange={(e) => setNewTicketData({...newTicketData, luggage: e.target.value})} placeholder="e.g. 20 - 07" className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary font-medium text-primary transition-all"/>
              </div>
            </div>

            <button disabled={loading} type="submit" className="mt-4 w-full py-4 bg-primary dark:bg-secondary text-white dark:text-on-secondary rounded-xl font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50">
              {loading ? 'SAVING TICKET...' : 'SAVE TICKET'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketsAdminView;
