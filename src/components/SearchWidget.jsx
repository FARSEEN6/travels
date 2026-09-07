import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const airports = [
  { code: 'CCJ', name: 'Kozhikode', city: 'Calicut', country: 'India' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'RUH', name: 'King Khalid', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
  { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', country: 'India' },
  { code: 'DEL', name: 'Indira Gandhi', city: 'Delhi', country: 'India' },
  { code: 'JED', name: 'King Abdulaziz', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'BAH', name: 'Bahrain Intl', city: 'Bahrain', country: 'Bahrain' },
  { code: 'KWI', name: 'Kuwait Intl', city: 'Kuwait', country: 'Kuwait' },
  { code: 'BLR', name: 'Kempegowda', city: 'Bangalore', country: 'India' },
  { code: 'MAA', name: 'Chennai Intl', city: 'Chennai', country: 'India' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA' },
];

const SearchWidget = ({ initialFrom, initialTo }) => {
  const [tripType, setTripType] = useState('one-way');
  const [from, setFrom] = useState(initialFrom || '');
  const [to, setTo] = useState(initialTo || '');
  const today = new Date().toISOString().split('T')[0];
  const [departDate, setDepartDate] = useState(today);
  const [returnDate, setReturnDate] = useState('');
  const [travelersPanelOpen, setTravelersPanelOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState('Economy');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
  }, [initialFrom, initialTo]);

  const filterAirports = (query) => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return airports.filter(a =>
      a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 5);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    navigate('/flight-results', { state: { from: from || 'CCJ', to: to || 'DXB', departDate, returnDate, adults, children, cabin, tripType, searched: true } });
  };

  const travelersDisplay = `${adults + children} Traveler${adults + children > 1 ? 's' : ''}, ${cabin}`;

  return (
    <div className="max-w-container-max mx-auto relative z-50">
      <div className="bg-white dark:bg-inverse-surface rounded-2xl shadow-xl p-6 flex flex-col gap-6 text-left w-full max-w-5xl mx-auto border-none">

        {/* Trip Type Toggle */}
        <div className="flex flex-wrap items-center justify-between px-4 text-on-surface dark:text-inverse-on-surface gap-4">
          <div className="flex items-center space-x-6">
            {['one-way', 'round-trip', 'multi-city'].map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                <input type="radio" name="trip" value={type} checked={tripType === type} onChange={(e) => setTripType(e.target.value)} className="w-4 h-4 text-primary dark:text-secondary-fixed border-outline focus:ring-primary" />
                <span className="font-label-caps text-[11px] font-bold tracking-widest text-outline dark:text-outline-variant group-hover:text-primary dark:group-hover:text-secondary-fixed transition-colors uppercase">{type.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity hidden md:flex">
              <input type="checkbox" className="rounded-sm border-outline-variant dark:border-outline text-primary focus:ring-primary w-4 h-4" />
              <span className="text-[11px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase">Direct Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity hidden md:flex">
              <input type="checkbox" className="rounded-sm border-outline-variant dark:border-outline text-primary focus:ring-primary w-4 h-4" />
              <span className="text-[11px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase">Student Fare</span>
            </label>
          </div>
        </div>

        {/* Input Grid */}
        <div className="flex flex-col md:flex-row items-center bg-white dark:bg-inverse-surface rounded-xl overflow-visible relative shadow-sm border border-outline-variant/50 dark:border-outline/50 divide-y md:divide-y-0 md:divide-x divide-outline-variant/50 dark:divide-outline/50 w-full">
          {/* Origin */}
          <div className="flex-1 w-full p-4 group relative hover:bg-surface-container-low/50 dark:hover:bg-primary-container/30 transition-colors rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
            <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1 px-1">Origin</label>
            <input value={from} onChange={(e) => { setFrom(e.target.value); setFromSuggestions(filterAirports(e.target.value)); }} type="text" placeholder="Where from?" className="w-full border-none bg-transparent p-1 focus:ring-0 font-bold text-[18px] placeholder:text-outline-variant placeholder:font-normal text-primary dark:text-white" />
            {fromSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto">
                {fromSuggestions.map(a => (
                  <button key={a.code} type="button" onClick={() => { setFrom(`${a.city} (${a.code})`); setFromSuggestions([]); }} className="w-full text-left px-4 py-3 hover:bg-surface-container-low dark:hover:bg-primary-container transition-colors flex justify-between items-center">
                    <div><span className="font-bold text-primary dark:text-white">{a.city}</span> <span className="text-outline text-body-sm">({a.code})</span></div>
                    <span className="text-[10px] text-outline">{a.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap */}
          <div className="hidden md:flex flex-none items-center justify-center -mx-5 z-20">
            <div onClick={handleSwap} className="bg-white dark:bg-inverse-surface border border-outline-variant/50 dark:border-outline/50 rounded-full w-10 h-10 cursor-pointer hover:rotate-180 transition-transform duration-300 shadow-md flex items-center justify-center text-primary dark:text-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            </div>
          </div>

          {/* Destination */}
          <div className="flex-1 w-full p-4 pl-4 md:pl-8 group relative hover:bg-surface-container-low/50 dark:hover:bg-primary-container/30 transition-colors">
            <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1 px-1">Destination</label>
            <input value={to} onChange={(e) => { setTo(e.target.value); setToSuggestions(filterAirports(e.target.value)); }} type="text" placeholder="Where to?" className="w-full border-none bg-transparent p-1 focus:ring-0 font-bold text-[18px] placeholder:text-outline-variant placeholder:font-normal text-primary dark:text-white" />
            {toSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto">
                {toSuggestions.map(a => (
                  <button key={a.code} type="button" onClick={() => { setTo(`${a.city} (${a.code})`); setToSuggestions([]); }} className="w-full text-left px-4 py-3 hover:bg-surface-container-low dark:hover:bg-primary-container transition-colors flex justify-between items-center">
                    <div><span className="font-bold text-primary dark:text-white">{a.city}</span> <span className="text-outline text-body-sm">({a.code})</span></div>
                    <span className="text-[10px] text-outline">{a.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Depart */}
          <div className="flex-1 w-full p-4 group hover:bg-surface-container-low/50 dark:hover:bg-primary-container/30 transition-colors">
            <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1 px-1">Depart</label>
            <input value={departDate} onChange={(e) => setDepartDate(e.target.value)} type="date" className="w-full border-none bg-transparent p-1 focus:ring-0 font-bold text-[16px] text-primary dark:text-white cursor-pointer" />
          </div>

          {/* Return */}
          <div className={`flex-1 w-full p-4 group hover:bg-surface-container-low/50 dark:hover:bg-primary-container/30 transition-colors ${tripType === 'one-way' ? 'opacity-40' : ''}`}>
            <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1 px-1">Return</label>
            <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)} type="date" disabled={tripType === 'one-way'} className="w-full border-none bg-transparent p-1 focus:ring-0 font-bold text-[16px] text-primary dark:text-white cursor-pointer" />
          </div>

          {/* Travelers */}
          <div className="flex-[1.2] w-full p-4 group relative cursor-pointer hover:bg-surface-container-low/50 dark:hover:bg-primary-container/30 transition-colors">
            <div onClick={() => setTravelersPanelOpen(!travelersPanelOpen)}>
              <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1 px-1 cursor-pointer">Travelers</label>
              <input readOnly type="text" value={travelersDisplay} className="w-full border-none bg-transparent p-1 focus:ring-0 font-bold text-[16px] text-primary dark:text-white placeholder:text-outline-variant cursor-pointer truncate" />
            </div>
            {travelersPanelOpen && (
              <div className="absolute right-0 top-full mt-4 bg-white dark:bg-inverse-surface border border-outline-variant dark:border-outline rounded-lg shadow-2xl z-30 p-6 w-72 flex flex-col gap-4 text-on-surface dark:text-inverse-on-surface cursor-default">
                <h4 className="font-bold text-body-md border-b border-outline-variant dark:border-outline pb-2">Travelers & Cabin</h4>
                <div className="flex justify-between items-center">
                  <div><p className="font-bold text-body-sm">Adults</p><p className="text-[10px] text-outline">Age 12+</p></div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low">-</button>
                    <span className="font-bold w-4 text-center">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div><p className="font-bold text-body-sm">Children</p><p className="text-[10px] text-outline">Age 2-11</p></div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low">-</button>
                    <span className="font-bold w-4 text-center">{children}</span>
                    <button type="button" onClick={() => setChildren(Math.min(9, children + 1))} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low">+</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="font-label-caps text-label-caps text-outline">Cabin Class</label>
                  <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="rounded border-outline-variant bg-white dark:bg-inverse-surface p-2 text-body-sm text-on-surface dark:text-inverse-on-surface focus:ring-secondary focus:border-secondary">
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First Class</option>
                  </select>
                </div>
                <button type="button" onClick={() => setTravelersPanelOpen(false)} className="w-full mt-2 bg-primary dark:bg-secondary text-white py-2 rounded text-label-caps font-bold tracking-widest hover:opacity-90 active:scale-[0.98]">DONE</button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="p-2 w-full md:w-auto h-full rounded-b-xl md:rounded-r-xl md:rounded-bl-none flex items-center">
            <button type="button" onClick={handleSearch} className="w-full md:w-auto min-h-[56px] min-w-[120px] bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary-fixed-dim text-white dark:text-on-secondary px-8 rounded-lg font-bold tracking-widest text-[12px] flex items-center justify-center transition-all active:scale-95 shadow-md">
              SEARCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;
