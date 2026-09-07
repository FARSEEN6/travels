import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const curatedDestinations = [
  {
    id: 1,
    country: 'Saudi Arabia',
    landmark: 'Kingdom Centre',
    city: 'Riyadh',
    code: 'RUH',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹12,200',
    image_url: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
    icon: 'mosque',
    desc: 'Kingdom Centre & Historic Diriyah'
  },
  {
    id: 2,
    country: 'UAE',
    landmark: 'Burj Khalifa',
    city: 'Dubai',
    code: 'DXB',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹14,000',
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    icon: 'location_city',
    desc: 'Burj Khalifa & Downtown Dubai'
  },
  {
    id: 3,
    country: 'Qatar',
    landmark: 'Doha Corniche',
    city: 'Doha',
    code: 'DOH',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹18,500',
    image_url: 'https://images.unsplash.com/photo-1579606032834-de00b21a86b1?auto=format&fit=crop&w=800&q=80',
    icon: 'domain',
    desc: 'Museum of Islamic Art & Skyline'
  },
  {
    id: 4,
    country: 'Oman',
    landmark: 'Sultan Qaboos Mosque',
    city: 'Muscat',
    code: 'MCT',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹13,800',
    image_url: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
    icon: 'fort',
    desc: 'Grand Mosque & Mutrah Corniche'
  },
  {
    id: 5,
    country: 'Kuwait',
    landmark: 'Kuwait Towers',
    city: 'Kuwait City',
    code: 'KWI',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹14,800',
    image_url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
    icon: 'domain',
    desc: 'Kuwait Towers & Arabian Gulf'
  },
  {
    id: 6,
    country: 'Bahrain',
    landmark: 'World Trade Center',
    city: 'Manama',
    code: 'BAH',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹16,200',
    image_url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80',
    icon: 'account_balance',
    desc: 'Bahrain World Trade Center'
  },
  {
    id: 7,
    country: 'Singapore',
    landmark: 'Marina Bay Sands',
    city: 'Singapore',
    code: 'SIN',
    keralaOrigin: 'Cochin (COK)',
    keralaCode: 'COK',
    price: '₹17,500',
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    icon: 'travel_explore',
    desc: 'Marina Bay & Gardens by the Bay'
  },
  {
    id: 8,
    country: 'Malaysia',
    landmark: 'Petronas Twin Towers',
    city: 'Kuala Lumpur',
    code: 'KUL',
    keralaOrigin: 'Cochin (COK)',
    keralaCode: 'COK',
    price: '₹15,900',
    image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    icon: 'location_city',
    desc: 'Petronas Towers & Batu Caves'
  },
  {
    id: 9,
    country: 'Thailand',
    landmark: 'Wat Arun Temple',
    city: 'Bangkok',
    code: 'BKK',
    keralaOrigin: 'Cochin (COK)',
    keralaCode: 'COK',
    price: '₹16,800',
    image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    icon: 'temple_buddhist',
    desc: 'Wat Arun & Grand Palace'
  },
  {
    id: 10,
    country: 'Sri Lanka',
    landmark: 'Sigiriya Fortress',
    city: 'Colombo',
    code: 'CMB',
    keralaOrigin: 'Trivandrum (TRV)',
    keralaCode: 'TRV',
    price: '₹9,900',
    image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
    icon: 'landscape',
    desc: 'Sigiriya Rock & Colombo Coast'
  },
  {
    id: 11,
    country: 'Europe',
    landmark: 'Eiffel Tower & West Europe',
    city: 'London / Paris',
    code: 'LHR',
    keralaOrigin: 'Cochin (COK)',
    keralaCode: 'COK',
    price: '₹38,500',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    icon: 'apartment',
    desc: 'Eiffel Tower, London Eye & Alps'
  },
  {
    id: 12,
    country: 'India',
    landmark: 'Taj Mahal & Delhi',
    city: 'Delhi',
    code: 'DEL',
    keralaOrigin: 'Kozhikode (CCJ)',
    keralaCode: 'CCJ',
    price: '₹4,800',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    icon: 'temple_hindu',
    desc: 'Taj Mahal & Historic Capitals'
  }
];

const categories = ['Flights', 'Departures', 'Umrah', 'Visa', 'Stamping'];

const Destinations = () => {
  const [activeCategory, setActiveCategory] = useState('Flights');
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();

  const destinations = curatedDestinations;

  const handleCardClick = (dest) => {
    setSelectedCard(dest);
  };

  const handleBookNow = (dest) => {
    navigate('/flight-results', {
      state: {
        from: dest.keralaOrigin,
        to: `${dest.city} (${dest.code})`,
        city: dest.city,
        country: dest.country,
        landmark: dest.landmark,
        price: dest.price
      }
    });
  };

  const closeDetail = () => {
    setSelectedCard(null);
  };

  return (
    <section className="max-w-container-max mx-auto px-margin-desktop py-stack-md mt-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-3">
          <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
          Departures From Kerala (CCJ • COK • TRV)
        </div>
        <h1 className="font-headline-xl text-headline-xl text-slate-950 mb-3 font-extrabold tracking-tight drop-shadow-sm">
          Popular Destinations
        </h1>
        <p className="text-slate-700 font-body-md font-medium">
          Exclusive B2B fares directly connecting Kerala airports to the world's most iconic landmarks and business hubs.
        </p>
      </div>

      {/* Category Submenu */}
      <div className="flex justify-center flex-wrap gap-2.5 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full font-label-caps text-label-caps font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-12">
        {destinations.map(dest => (
          <div
            key={dest.id}
            onClick={() => handleCardClick(dest)}
            className="rounded-[22px] overflow-hidden shadow-md group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-slate-200/80 bg-slate-900 relative"
          >
            <div 
              className="relative aspect-[4/5] flex flex-col justify-between p-4"
              style={{ backgroundImage: `url(${dest.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/30 transition-opacity duration-300 group-hover:opacity-85"></div>

              {/* Top Bar: Kerala Departure Badge */}
              <div className="z-10 flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="material-symbols-outlined text-[12px] text-secondary-fixed">flight_takeoff</span>
                  From {dest.keralaCode}
                </span>
                <span className="bg-primary/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                  {dest.code}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="z-10 flex flex-col w-full">
                <p className="text-secondary-fixed text-[11px] font-semibold tracking-wide mb-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  {dest.landmark}
                </p>
                <h3 className="text-white font-bold text-[20px] sm:text-[22px] tracking-tight leading-tight mb-2 group-hover:text-secondary-fixed transition-colors">
                  {dest.country}
                </h3>
                
                <div className="flex justify-between items-center w-full border-t border-white/20 pt-2.5 mt-1">
                  <div>
                    <span className="text-white/60 text-[9px] uppercase font-bold block leading-none">Starting From</span>
                    <span className="text-white font-extrabold text-[15px]">{dest.price}</span>
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBookNow(dest); }}
                    className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 active:scale-95"
                    title={`Book flights from ${dest.keralaOrigin} to ${dest.country}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ======== DETAIL MODAL (Opens when a card is clicked) ======== */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm" onClick={closeDetail}>
          <div
            className="bg-white dark:bg-inverse-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-outline-variant/30 dark:border-outline/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-8 relative min-h-[160px] flex flex-col justify-between"
              style={{ backgroundImage: `url(${selectedCard.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
              
              <div className="flex justify-between items-center z-10 relative">
                <span className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
                  Direct From {selectedCard.keralaOrigin}
                </span>
                <button onClick={closeDetail} className="material-symbols-outlined text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors">close</button>
              </div>
              
              <div className="mt-8 z-10 relative">
                <p className="text-secondary-fixed text-xs font-bold tracking-wide flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {selectedCard.landmark}
                </p>
                <h2 className="text-white font-headline-xl text-[32px] font-extrabold tracking-tight leading-none">
                  {selectedCard.country}
                </h2>
                <p className="text-white/70 text-[12px] font-medium mt-1">
                  {selectedCard.city} ({selectedCard.code}) • {selectedCard.desc}
                </p>
              </div>
            </div>

            {/* Modal Body - Flight Ticket Style */}
            <div className="p-6">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-left text-on-surface dark:text-inverse-on-surface mb-6">
                <div>
                  <p className="text-label-caps font-label-caps text-outline uppercase font-semibold">Origin (Kerala)</p>
                  <p className="font-bold text-body-md text-primary dark:text-secondary-fixed mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                    {selectedCard.keralaOrigin}
                  </p>
                </div>
                <div>
                  <p className="text-label-caps font-label-caps text-outline uppercase font-semibold">Destination</p>
                  <p className="font-bold text-body-md text-slate-800 dark:text-white mt-1">
                    {selectedCard.city} ({selectedCard.code})
                  </p>
                </div>
                <div>
                  <p className="text-label-caps font-label-caps text-outline uppercase font-semibold">Starting Fare</p>
                  <p className="font-extrabold text-2xl text-primary mt-0.5">{selectedCard.price}</p>
                </div>
                <div>
                  <p className="text-label-caps font-label-caps text-outline uppercase font-semibold">Seat Availability</p>
                  <p className="font-bold text-body-sm text-emerald-600 dark:text-emerald-400 mt-1 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Kerala Quota Open
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { closeDetail(); handleBookNow(selectedCard); }}
                  className="w-full py-4 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold tracking-wider text-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SEARCH FLIGHTS FROM {selectedCard.keralaCode} TO {selectedCard.code}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={closeDetail}
                  className="w-full py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aashmi Running Advertisement */}
      <div className="bg-primary dark:bg-[#0b1c30] text-white rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm relative flex items-center py-5">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary dark:from-[#0b1c30] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary dark:from-[#0b1c30] to-transparent z-10"></div>
        <div className="flex animate-marquee whitespace-nowrap items-center w-max">
          <div className="flex items-center gap-12 px-6">
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">workspace_premium</span> AASHMI EXCLUSIVE</span>
            <span className="text-on-primary font-medium opacity-90">Enjoy 20% off all First Class bookings this month.</span>
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">flight_takeoff</span> CHARTER FLIGHTS</span>
            <span className="text-on-primary font-medium opacity-90">Book private jets instantly via our Concierge desk.</span>
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">diamond</span> VIP LOUNGE</span>
            <span className="text-on-primary font-medium opacity-90">Complimentary lounge access at DXB and CCJ.</span>
          </div>
          <div className="flex items-center gap-12 px-6">
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">workspace_premium</span> AASHMI EXCLUSIVE</span>
            <span className="text-on-primary font-medium opacity-90">Enjoy 20% off all First Class bookings this month.</span>
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">flight_takeoff</span> CHARTER FLIGHTS</span>
            <span className="text-on-primary font-medium opacity-90">Book private jets instantly via our Concierge desk.</span>
            <span className="flex items-center gap-2 font-bold tracking-widest text-secondary-fixed"><span className="material-symbols-outlined text-[18px]">diamond</span> VIP LOUNGE</span>
            <span className="text-on-primary font-medium opacity-90">Complimentary lounge access at DXB and CCJ.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
