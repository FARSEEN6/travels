import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AllTicketsAdminView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    // Fetch tickets and join with destinations to get the country/city
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        destination:destinations (
          country,
          city
        )
      `)
      .order('created_at', { ascending: false });
      
    if (data) setTickets(data);
    if (error && error.code !== '42P01') console.error(error);
    setLoading(false);
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTickets();
  };

  return (
    <div className="w-full bg-white dark:bg-inverse-surface p-8 rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30 flex flex-col min-h-[600px]">
      <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-2">
        All System Tickets
      </h3>
      <p className="text-body-sm text-outline dark:text-outline-variant mb-8">
        Manage all tickets across all destinations.
      </p>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-outline font-bold tracking-widest text-label-caps animate-pulse">LOADING TICKETS...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-outline-variant rounded-2xl text-outline font-medium">
              No tickets found in the system.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="relative bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 hover:shadow-md transition-shadow">
                
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 pr-8">
                  
                  {/* Dest / Date */}
                  <div className="flex flex-col min-w-[120px]">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">
                        {ticket.destination?.country || 'Unknown'}
                    </span>
                    <span className="text-body-sm font-bold text-on-surface">
                      {new Date(ticket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Airline */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    {ticket.airline_logo_url ? (
                      <img src={ticket.airline_logo_url} alt={ticket.airline} className="h-8 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-outline">flight</span>
                    )}
                    <span className="text-body-sm font-bold capitalize">{ticket.airline}</span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4 flex-grow min-w-[200px] justify-center bg-surface-container-low px-4 py-2 rounded-xl">
                    <div className="text-right">
                      <p className="text-[10px] text-outline font-bold tracking-widest uppercase mb-0.5">{ticket.from_city}</p>
                      <p className="text-title-md font-bold text-primary">{ticket.from_code}</p>
                      <p className="text-xs text-outline font-medium">{ticket.departure_time}</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary transform rotate-90 md:rotate-0">flight_takeoff</span>
                    <div>
                      <p className="text-[10px] text-outline font-bold tracking-widest uppercase mb-0.5">{ticket.to_city}</p>
                      <p className="text-title-md font-bold text-primary">{ticket.to_code}</p>
                      <p className="text-xs text-outline font-medium">{ticket.arrival_time}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col min-w-[100px] items-end">
                    <span className="text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Seats</span>
                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-bold">{ticket.available_seats} Left</span>
                  </div>
                  
                  <div className="flex flex-col min-w-[100px] items-end">
                    <span className="text-title-lg font-bold text-primary">{ticket.price}</span>
                    <span className="text-[10px] text-outline font-bold tracking-widest uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">luggage</span> {ticket.luggage}
                    </span>
                  </div>

                </div>

                <button onClick={() => handleDeleteTicket(ticket.id)} className="absolute top-2 right-2 material-symbols-outlined text-[18px] text-error hover:bg-error/10 p-1.5 rounded-full transition-colors" title="Delete Ticket">
                  delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AllTicketsAdminView;
