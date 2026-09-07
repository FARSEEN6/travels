import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const flightsDatabase = [
  { id: 1, airline: 'IndiGo', flightNo: '6E-104', from: 'CCJ', to: 'DXB', depTime: '18:30', arrTime: '21:05', duration: '4h 05m', durationMin: 245, stops: 0, stopDetails: 'Direct', options: [{ name: 'Saver', price: 15400 }, { name: 'Flexi Plus', price: 17200 }], chips: ['NON-REFUNDABLE', '15 KG', 'MEAL INCLUDED'] },
  { id: 2, airline: 'Air India Express', flightNo: 'IX-1475', from: 'CCJ', to: 'DXB', depTime: '06:45', arrTime: '09:15', duration: '3h 55m', durationMin: 235, stops: 0, stopDetails: 'Direct', options: [{ name: 'Lite', price: 16739 }, { name: 'Value', price: 17747 }], chips: ['REFUNDABLE', '20 KG', 'MEAL INCLUDED'] },
  { id: 3, airline: 'Air India Express', flightNo: 'IX-1473', from: 'CCJ', to: 'DXB', depTime: '23:10', arrTime: '01:35', duration: '3h 55m', durationMin: 235, stops: 0, stopDetails: 'Direct', options: [{ name: 'Lite', price: 16900 }, { name: 'Value', price: 17950 }], chips: ['REFUNDABLE', '20 KG'] },
  { id: 4, airline: 'IndiGo', flightNo: '6E-291, 563', from: 'CCJ', to: 'DXB', depTime: '01:20', arrTime: '10:15', duration: '9h 25m', durationMin: 565, stops: 1, stopDetails: 'Via BLR', options: [{ name: 'Saver', price: 16150 }, { name: 'Flexi Plus', price: 18100 }], chips: ['NON-REFUNDABLE', '15 KG'] },
  { id: 5, airline: 'Air India', flightNo: 'AI-937', from: 'CCJ', to: 'DXB', depTime: '10:00', arrTime: '17:35', duration: '8h 05m', durationMin: 485, stops: 1, stopDetails: 'Via Mumbai', options: [{ name: 'Saver', price: 17300 }, { name: 'Super Value', price: 19800 }], chips: ['REFUNDABLE', '25 KG', 'MEAL INCLUDED'] },
  { id: 6, airline: 'Oman Air', flightNo: 'WY-298, 611', from: 'CCJ', to: 'DXB', depTime: '08:55', arrTime: '21:25', duration: '14h 00m', durationMin: 840, stops: 1, stopDetails: 'Via Muscat', options: [{ name: 'Eco Saver', price: 18254 }, { name: 'Eco Comfort', price: 19682 }], chips: ['NON-REFUNDABLE', '30 KG', 'EXTRA LEGROOM'] },
  { id: 7, airline: 'flynas', flightNo: 'XY-331, 882', from: 'CCJ', to: 'DXB', depTime: '11:15', arrTime: '14:20', duration: '4h 35m', durationMin: 275, stops: 0, stopDetails: 'Direct', options: [{ name: 'Standard', price: 22150 }, { name: 'Premium', price: 26740 }], chips: ['REFUNDABLE', '25 KG', 'ONLY 2 SEATS LEFT'] },
  { id: 8, airline: 'flynas', flightNo: 'XY-335, 781', from: 'CCJ', to: 'DXB', depTime: '20:15', arrTime: '09:40', duration: '13h 55m', durationMin: 835, stops: 1, stopDetails: 'Via Riyadh', options: [{ name: 'Standard', price: 18900 }, { name: 'Premium', price: 21500 }], chips: ['NON-REFUNDABLE', '20 KG'] },
  { id: 9, airline: 'Gulf Air', flightNo: 'GF-69, 504', from: 'CCJ', to: 'DXB', depTime: '17:30', arrTime: '23:45', duration: '6h 45m', durationMin: 405, stops: 1, stopDetails: 'Via Bahrain', options: [{ name: 'Eco Smart', price: 21250 }, { name: 'Eco Flex', price: 24300 }], chips: ['REFUNDABLE', '30 KG', 'MEAL INCLUDED'] },
  { id: 10, airline: 'Emirates', flightNo: 'EK-562', from: 'CCJ', to: 'DXB', depTime: '04:30', arrTime: '06:50', duration: '3h 50m', durationMin: 230, stops: 0, stopDetails: 'Direct', options: [{ name: 'Special', price: 28900 }, { name: 'Flex', price: 34500 }], chips: ['REFUNDABLE', '30 KG', 'FREE WI-FI', 'LOUNGE ACCESS'] },
  { id: 11, airline: 'Emirates', flightNo: 'EK-564', from: 'CCJ', to: 'DXB', depTime: '14:30', arrTime: '16:50', duration: '3h 50m', durationMin: 230, stops: 0, stopDetails: 'Direct', options: [{ name: 'Special', price: 31200 }, { name: 'Flex', price: 36800 }], chips: ['REFUNDABLE', '35 KG', 'FREE WI-FI'] },
  { id: 12, airline: 'Qatar Airways', flightNo: 'QR-507, 1002', from: 'CCJ', to: 'DXB', depTime: '09:10', arrTime: '17:50', duration: '9h 10m', durationMin: 550, stops: 1, stopDetails: 'Via Doha', options: [{ name: 'Eco Classic', price: 29500 }, { name: 'Eco Convenience', price: 33400 }], chips: ['REFUNDABLE', '30 KG', 'MEAL INCLUDED', 'AWARD WINNING'] },
];

const defaultAirlineLogos = {
  'IndiGo': 'https://images.kiwi.com/airlines/64x64/6E.png',
  'Air India Express': 'https://images.kiwi.com/airlines/64x64/IX.png',
  'Air India': 'https://images.kiwi.com/airlines/64x64/AI.png',
  'flynas': 'https://images.kiwi.com/airlines/64x64/XY.png',
  'Oman Air': 'https://images.kiwi.com/airlines/64x64/WY.png',
  'Gulf Air': 'https://images.kiwi.com/airlines/64x64/GF.png',
  'Emirates': 'https://images.kiwi.com/airlines/64x64/EK.png',
  'Qatar Airways': 'https://images.kiwi.com/airlines/64x64/QR.png',
  'Singapore Airlines': 'https://images.kiwi.com/airlines/64x64/SQ.png',
};

const defaultAirlineAircraftImages = {
  'IndiGo': '/airlines/indigo.jpg',
  'Air India Express': '/airlines/airindiaexpress.jpg',
  'Air India': '/airlines/airindia.jpg',
  'flynas': '/airlines/flynas.jpg',
  'Oman Air': '/airlines/omanair.jpg',
  'Gulf Air': '/airlines/gulfair.jpg',
  'Emirates': '/airlines/emirates.jpg',
  'Qatar Airways': '/airlines/qatarairways.jpg',
  'Singapore Airlines': '/airlines/singaporeairlines.jpg',
};

const formatPrice = (p) => '₹ ' + p.toLocaleString('en-IN');

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const s = location.state || {};
  const fromDisplay = s.from || 'Kozhikode (CCJ)';
  const toDisplay = s.to || 'Dubai (DXB)';
  const dateDisplay = s.departDate || new Date().toISOString().split('T')[0];

  const [sort, setSort] = useState('cheapest');
  const [stopFilter, setStopFilter] = useState([]);
  const [maxPrice, setMaxPrice] = useState(40000);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [dbFlights, setDbFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom airline logos uploaded by user, stored in localStorage
  const [customLogos, setCustomLogos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('custom_airline_logos') || '{}');
    } catch {
      return {};
    }
  });

  const handleLogoUpload = (flightId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setCustomLogos(prev => {
        const updated = { ...prev, [flightId]: dataUrl };
        try {
          localStorage.setItem('custom_airline_logos', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save logo to localStorage', err);
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = (flightId) => {
    setCustomLogos(prev => {
      const updated = { ...prev };
      delete updated[flightId];
      try {
        localStorage.setItem('custom_airline_logos', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage', err);
      }
      return updated;
    });
  };

  const getFlightLogo = (flight) => {
    if (customLogos[flight.id]) return customLogos[flight.id];
    if (customLogos[flight.airline]) return customLogos[flight.airline];
    if (flight.logo) return flight.logo;
    if (flight.logo_url) return flight.logo_url;
    return defaultAirlineLogos[flight.airline] || null;
  };

  const getFlightAircraft = (flight) => {
    if (flight.aircraft_image) return flight.aircraft_image;
    return defaultAirlineAircraftImages[flight.airline] || '/airlines/indigo.jpg';
  };

  const toggleStop = (v) => {
    setStopFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  // Extract just the IATA codes if the string looks like "Kozhikode (CCJ)"
  const extractCode = (str) => {
    if (!str) return '';
    const match = str.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : str;
  };

  const fromCode = extractCode(s.from) || 'CCJ';
  const toCode = extractCode(s.to) || 'DXB';

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const { data, error } = await supabase
          .from('flights')
          .select('*')
          .eq('origin_code', fromCode)
          .eq('dest_code', toCode);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setDbFlights(data);
        }
      } catch (err) {
        console.warn('Failed to fetch flights from Supabase, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [fromCode, toCode]);

  // If using fallback data, dynamically adjust the 'from' and 'to' fields so the demo always looks correct for the searched route
  const demoFlights = flightsDatabase.map(f => ({ ...f, from: fromCode, to: toCode }));
  const currentFlights = dbFlights.length > 0 ? dbFlights : demoFlights;

  let flights = currentFlights.filter(f => f.options && f.options[0]?.price <= maxPrice);
  if (stopFilter.length > 0) {
    flights = flights.filter(f => stopFilter.includes(f.stops));
  }

  flights = [...flights].sort((a, b) => {
    if (sort === 'cheapest') return a.options[0].price - b.options[0].price;
    if (sort === 'fastest') return a.durationMin - b.durationMin;
    if (sort === 'earliest') return a.depTime.localeCompare(b.depTime);
    return 0;
  });

  const handleBook = (flight, option) => {
    setSelectedFlight(flight);
    setSelectedOption(option);
  };

  return (
    <div className="view-section flex-grow bg-surface dark:bg-on-primary-fixed">
      {/* Top Header */}
      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-md">
        <div className="mb-stack-md flex flex-col md:flex-row justify-between items-end gap-4 border-b border-outline-variant dark:border-outline pb-6">
          <div className="space-y-1">
            <h1 className="font-headline-lg text-headline-lg text-primary dark:text-secondary-fixed font-bold tracking-tight">
              {fromDisplay} → {toDisplay}
            </h1>
            <p className="text-on-surface-variant dark:text-outline-variant font-body-sm">
              {dateDisplay} • {s.adults || 1} Adult{(s.adults || 1) > 1 ? 's' : ''} • {s.cabin || 'Economy'} Class
            </p>
          </div>
        </div>


        <div className="max-w-5xl mx-auto items-start">
          {/* Flight Cards */}
          <section className="space-y-stack-md">
            <p className="text-body-sm text-on-surface-variant dark:text-outline-variant">{flights.length} flights found</p>

            {/* Flight Cards List */}
            {flights.map(flight => {
              const logoUrl = getFlightLogo(flight);
              const aircraftImg = getFlightAircraft(flight);
              const isCustomLogo = Boolean(customLogos[flight.id] || customLogos[flight.airline]);
              const activeOption = selectedFlight?.id === flight.id && selectedOption ? selectedOption : flight.options[0];

              return (
                <div
                  key={flight.id}
                  className="rounded-2xl border border-slate-700/60 shadow-xl hover:shadow-2xl hover:border-secondary-fixed/50 transition-all duration-500 overflow-hidden mb-6 group relative bg-slate-950"
                >
                  {/* Real Airline Aircraft Flight Background (Crystal Clear, No White Shade) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${aircraftImg})` }}
                  />
                  {/* Subtle Dark Vignette for High Contrast & Ultimate Clarity */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/90 pointer-events-none transition-opacity duration-300" />

                  {/* Card Content Wrapper */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Card Header Strip */}
                    <div className="px-6 py-3.5 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
                      {/* Airline Identity & Logo */}
                      <div className="flex items-center gap-3">
                        {/* Logo Avatar with File Upload */}
                        <div className="relative group/avatar">
                          <label
                            htmlFor={`logo-upload-${flight.id}`}
                            className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md border border-white/30 flex items-center justify-center cursor-pointer hover:border-secondary-fixed transition-all overflow-hidden relative block"
                            title="Click to add or change airline logo"
                          >
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={flight.airline}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs tracking-wider"
                              style={{ display: logoUrl ? 'none' : 'flex' }}
                            >
                              {flight.airline.slice(0, 2).toUpperCase()}
                            </div>
                            {/* Hover Upload Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-semibold">
                              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                              <span>Upload</span>
                            </div>
                          </label>
                          <input
                            type="file"
                            id={`logo-upload-${flight.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleLogoUpload(flight.id, e.target.files[0]);
                            }}
                          />
                        </div>

                        {/* Airline Name & Flight Number */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white leading-tight drop-shadow-sm">
                              {flight.airline}
                            </h4>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white/15 border border-white/20 text-white/90">
                              {flight.flightNo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <label
                              htmlFor={`logo-upload-${flight.id}`}
                              className="text-[11px] font-semibold text-secondary-fixed hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">add_photo_alternate</span>
                              {isCustomLogo ? 'Change Logo' : 'Add Logo'}
                            </label>
                            {isCustomLogo && (
                              <button
                                type="button"
                                onClick={() => handleResetLogo(flight.id)}
                                className="text-[10px] text-red-400 hover:underline cursor-pointer font-medium"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Flight Status Badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-secondary-fixed bg-secondary-fixed/20 px-2.5 py-1 rounded-full border border-secondary-fixed/40 flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[13px]">flight</span>
                          {flight.airline} Fleet
                        </span>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                            flight.stops === 0
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop • ${flight.stopDetails}`}
                        </span>
                        <span className="text-[11px] font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                          Class Y
                        </span>
                      </div>
                    </div>

                    {/* Card Main Body */}
                    <div className="p-6 md:p-7 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                      {/* Flight Schedule Timeline */}
                      <div className="flex-grow flex items-center justify-between gap-4 sm:gap-8 w-full">
                        {/* Departure */}
                        <div className="text-left min-w-[90px]">
                          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                            {flight.depTime}
                          </div>
                          <div className="font-bold text-sm text-secondary-fixed mt-0.5 drop-shadow-sm">
                            {flight.from}
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium">
                            Departure
                          </div>
                        </div>

                        {/* Path Visualization */}
                        <div className="flex-grow flex flex-col items-center max-w-[220px] px-2">
                          <span className="text-[11px] font-bold text-white/90 tracking-wider uppercase mb-1 drop-shadow-sm">
                            {flight.duration}
                          </span>
                          <div className="w-full relative flex items-center justify-center my-1.5">
                            <div className="w-full h-[2px] bg-gradient-to-r from-secondary-fixed/30 via-secondary-fixed to-secondary-fixed/30"></div>
                            <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-secondary-fixed"></div>
                            <div className="absolute bg-slate-900/90 p-1.5 rounded-full shadow-md border border-secondary-fixed/50 backdrop-blur-sm">
                              <span className="material-symbols-outlined text-[15px] text-secondary-fixed transform rotate-90 block">
                                flight
                              </span>
                            </div>
                            <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-secondary-fixed"></div>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-300 mt-0.5 drop-shadow-sm">
                            {flight.stops === 0 ? 'Direct Route' : flight.stopDetails}
                          </span>
                        </div>

                        {/* Arrival */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                            {flight.arrTime}
                          </div>
                          <div className="font-bold text-sm text-secondary-fixed mt-0.5 drop-shadow-sm">
                            {flight.to}
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium">
                            Arrival
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="hidden lg:block w-[1px] self-stretch bg-white/15"></div>
                      <div className="block lg:hidden w-full h-[1px] bg-white/15"></div>

                      {/* Fare Selector & Booking Action */}
                      <div className="w-full lg:w-72 flex flex-col shrink-0">
                        {/* Interactive Fare Pills */}
                        <div className="grid grid-cols-2 gap-2 mb-3.5">
                          {flight.options.map((opt, i) => {
                            const isSelected = activeOption.name === opt.name;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleBook(flight, opt)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
                                  isSelected
                                    ? 'border-secondary-fixed bg-secondary-fixed/20 ring-1 ring-secondary-fixed shadow-md'
                                    : 'border-white/20 hover:border-secondary-fixed/50 bg-slate-950/60 hover:bg-slate-900/80'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                  <span>{opt.name}</span>
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isSelected
                                        ? 'bg-secondary-fixed shadow-sm'
                                        : 'border border-white/40'
                                    }`}
                                  ></span>
                                </div>
                                <div className="text-sm font-black text-white mt-1">
                                  {formatPrice(opt.price)}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Book Button */}
                        <button
                          onClick={() => handleBook(flight, activeOption)}
                          className="w-full py-3.5 px-5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                        >
                          <span>BOOK NOW</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBook(flight, activeOption)}
                          className="mt-2 text-center text-slate-300 hover:text-secondary-fixed font-semibold text-[11px] hover:underline transition-colors drop-shadow-sm"
                        >
                          Fare Rules & Details
                        </button>
                      </div>
                    </div>

                    {/* Amenities / Chips Strip */}
                    <div className="bg-slate-950/70 backdrop-blur-md px-6 py-2.5 border-t border-white/10 flex flex-wrap items-center gap-4 text-[11px]">
                      {(flight.chips || []).map((chip, i) => (
                        <span
                          key={i}
                          className={`flex items-center gap-1.5 font-semibold ${
                            chip.includes('NON-REF')
                              ? 'text-rose-400'
                              : chip.includes('REF')
                              ? 'text-emerald-400'
                              : 'text-slate-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {chip.includes('NON-REF')
                              ? 'cancel'
                              : chip.includes('REF')
                              ? 'check_circle'
                              : chip.includes('KG')
                              ? 'luggage'
                              : chip.includes('MEAL')
                              ? 'restaurant'
                              : 'info'}
                          </span>
                          {chip}
                        </span>
                      ))}
                      <span className="ml-auto font-bold text-[11px] text-secondary-fixed">
                        CLASS : Y
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {flights.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-inverse-surface rounded-xl border border-outline-variant/30 dark:border-outline/30">
                <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-4">flight_takeoff</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-outline-variant mb-2">No Flights Found</h3>
                <p className="text-body-sm text-outline">Try adjusting your filters or increasing the price range.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ======== BOOKING CONFIRMATION DRAWER ======== */}
      {selectedFlight && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setSelectedFlight(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-surface dark:bg-on-primary-fixed border-l border-outline-variant dark:border-outline shadow-2xl z-[80] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant/30 dark:border-outline/30 flex justify-between items-center bg-white dark:bg-inverse-surface">
              <h3 className="font-headline-lg text-body-md font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider">E-Ticket Summary</h3>
              <button onClick={() => setSelectedFlight(null)} className="material-symbols-outlined p-2 hover:bg-surface-container-low dark:hover:bg-primary-container rounded-full transition-all">close</button>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-inverse-surface rounded-xl border border-outline-variant/30 dark:border-outline/30 overflow-hidden shadow-sm">
                {/* Ticket Header */}
                <div className="p-6 bg-primary dark:bg-[#0b1c30] text-white relative overflow-hidden">
                  {/* Airline Aircraft Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
                    style={{ backgroundImage: `url(${getFlightAircraft(selectedFlight)})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/65 dark:from-[#0b1c30]/95 dark:via-[#0b1c30]/85 dark:to-[#0b1c30]/70 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getFlightLogo(selectedFlight) && (
                        <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <img src={getFlightLogo(selectedFlight)} alt={selectedFlight.airline} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Airline</p>
                        <p className="font-bold text-body-md mt-0.5">{selectedFlight.airline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Flight</p>
                      <p className="font-bold text-body-md mt-1">{selectedFlight.flightNo}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-6">
                    <div className="col-span-2 text-left">
                      <h2 className="text-[28px] font-bold leading-none">{selectedFlight.from}</h2>
                      <p className="text-[11px] opacity-60 uppercase font-medium mt-1">Departure</p>
                      <p className="text-[18px] font-bold mt-1">{selectedFlight.depTime}</p>
                    </div>
                    <div className="col-span-1 flex flex-col items-center">
                      <span className="material-symbols-outlined text-secondary-fixed">flight_takeoff</span>
                      <div className="w-full border-b border-dashed border-white/30 mt-1"></div>
                      <p className="text-[9px] mt-1 opacity-50">{selectedFlight.duration}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <h2 className="text-[28px] font-bold leading-none">{selectedFlight.to}</h2>
                      <p className="text-[11px] opacity-60 uppercase font-medium mt-1">Arrival</p>
                      <p className="text-[18px] font-bold mt-1">{selectedFlight.arrTime}</p>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Perforation */}
                <div className="relative flex items-center">
                  <div className="absolute -left-3 w-6 h-6 bg-surface dark:bg-on-primary-fixed rounded-full border-r border-outline-variant/20"></div>
                  <div className="w-full border-t-2 border-dashed border-outline-variant/30 dark:border-outline/30 mx-6"></div>
                  <div className="absolute -right-3 w-6 h-6 bg-surface dark:bg-on-primary-fixed rounded-full border-l border-outline-variant/20"></div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-4 text-on-surface dark:text-inverse-on-surface">
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Date</p>
                    <p className="font-bold text-body-md mt-1">{dateDisplay}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Class</p>
                    <p className="font-bold text-body-md mt-1">{s.cabin || 'Economy'}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Fare</p>
                    <p className="font-bold text-body-md mt-1">{selectedOption?.name}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Stops</p>
                    <p className="font-bold text-body-md mt-1">{selectedFlight.stops === 0 ? 'Direct' : selectedFlight.stopDetails}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Passengers</p>
                    <p className="font-bold text-body-md mt-1">{s.adults || 1} Adult{(s.adults || 1) > 1 ? 's' : ''}{(s.children || 0) > 0 ? `, ${s.children} Child` : ''}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline uppercase">Total Amount</p>
                    <p className="font-bold text-price-display text-secondary dark:text-secondary-fixed mt-1">{formatPrice(selectedOption?.price || 0)}</p>
                  </div>
                </div>

                {/* Chips */}
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                  {(selectedFlight.chips || []).map((chip, i) => (
                    <span key={i} className="bg-surface-container-low dark:bg-primary-container text-[9px] font-bold tracking-widest text-on-surface-variant dark:text-outline-variant px-2.5 py-1 rounded-full border border-outline-variant/30 dark:border-outline/30 uppercase">{chip}</span>
                  ))}
                </div>

                {/* Barcode */}
                <div className="p-6 bg-surface-container-low dark:bg-primary-container flex flex-col items-center gap-3 border-t border-outline-variant/20">
                  <div className="w-full h-14 bg-gradient-to-r from-primary via-outline to-primary opacity-20 rounded"></div>
                  <p className="text-label-caps font-label-caps text-outline font-bold">FBB-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-6">
                <button className="w-full py-4 bg-primary dark:bg-secondary text-white rounded-lg font-bold tracking-widest text-label-caps hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  CONFIRM BOOKING <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </button>
                <button onClick={() => setSelectedFlight(null)} className="w-full py-4 border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface rounded-lg font-bold tracking-widest text-label-caps hover:bg-surface-container-low transition-all">
                  GO BACK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FlightResults;
