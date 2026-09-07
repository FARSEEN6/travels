import React, { useState, useEffect } from 'react';
import SearchWidget from '../components/SearchWidget';
import { supabase } from '../lib/supabase';

const fallbackAirlines = [
  { id: 1, name: 'Emirates', commission: 'Up to 12%', alliance: 'Independent', route_focus: 'Global / Middle East', is_premium: true, is_new: false },
  { id: 2, name: 'Singapore Airlines', commission: 'Up to 10.5%', alliance: 'Star Alliance', route_focus: 'Asia Pacific', is_premium: false, is_new: false },
  { id: 3, name: 'Lufthansa', commission: 'Fixed 8% + Incentives', alliance: 'Star Alliance', route_focus: 'Europe / Transatlantic', is_premium: false, is_new: true },
  { id: 4, name: 'Qatar Airways', commission: 'Up to 11%', alliance: 'oneworld', route_focus: 'Global / Middle East', is_premium: false, is_new: false },
  { id: 5, name: 'IndiGo', commission: 'Net Fares', alliance: 'Independent', route_focus: 'Asia / Middle East', is_premium: false, is_new: false },
];

const AirlinePortal = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const { data, error } = await supabase.from('airline_partners').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAirlines(data);
        } else {
          setAirlines(fallbackAirlines);
        }
      } catch (err) {
        console.warn('Failed to fetch from Supabase, using fallback data:', err);
        setAirlines(fallbackAirlines);
      } finally {
        setLoading(false);
      }
    };
    fetchAirlines();
  }, []);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex-grow w-full space-y-stack-lg">
      
      {/* Quick Search Widget */}
      <section>
        <SearchWidget />
      </section>

      {/* Hero Section / Intro */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end gap-stack-md">
          <div className="max-w-2xl">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-base">Elite Partnerships</span>
            <h1 className="font-headline-xl text-headline-xl mb-stack-sm text-primary dark:text-white">Global Airline Ecosystem</h1>
            <p className="text-on-surface-variant dark:text-outline-variant text-body-md leading-relaxed">
              Access exclusive B2B commissions and real-time inventory from our premier airline partners. Our curated network ensures the highest profitability for your corporate travel desk.
            </p>
          </div>
          <div className="flex gap-base">
            <button className="bg-primary dark:bg-secondary text-white px-gutter py-3 font-semibold rounded-lg hover:opacity-90 transition-opacity">Request Partner Access</button>
            <button className="border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface px-gutter py-3 font-semibold rounded-lg hover:bg-surface-container-low dark:hover:bg-primary-container transition-colors">Download Rate Cards</button>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="bg-white/80 dark:bg-inverse-surface/80 backdrop-blur-md border border-outline-variant/50 dark:border-outline/50 p-gutter rounded-xl flex flex-wrap items-center gap-gutter shadow-sm">
        <div className="flex-1 min-w-[280px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full pl-12 pr-4 py-3 bg-transparent border-b border-outline-variant dark:border-outline focus:border-secondary transition-colors outline-none font-body-md text-on-surface dark:text-inverse-on-surface" placeholder="Search airline by name or IATA code..." type="text" />
        </div>
        <div className="flex items-center gap-base">
          <span className="font-label-caps text-label-caps text-on-surface-variant dark:text-outline-variant">Filter By:</span>
          <select className="bg-surface-container-low dark:bg-primary-container text-on-surface dark:text-inverse-on-surface border-none rounded-lg px-4 py-2 font-body-sm focus:ring-0">
            <option>All Alliances</option>
            <option>Star Alliance</option>
            <option>SkyTeam</option>
            <option>oneworld</option>
          </select>
          <select className="bg-surface-container-low dark:bg-primary-container text-on-surface dark:text-inverse-on-surface border-none rounded-lg px-4 py-2 font-body-sm focus:ring-0">
            <option>Commission Type</option>
            <option>Upfront</option>
            <option>Post-ticketing</option>
            <option>Net Fare</option>
          </select>
        </div>
      </div>

      {/* Airline Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {airlines.map((airline) => (
          <div key={airline.id} className="group relative bg-white dark:bg-inverse-surface border border-outline-variant/50 dark:border-outline/50 p-gutter rounded-lg transition-all hover:shadow-xl hover:border-secondary dark:hover:border-secondary-fixed overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-16 h-16 bg-surface-container-low dark:bg-primary-container rounded flex items-center justify-center overflow-hidden">
                {airline.logo_url ? (
                  <img src={airline.logo_url} alt={airline.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="material-symbols-outlined text-[32px] text-primary dark:text-secondary-fixed">flight</span>
                )}
              </div>
              {airline.is_premium && <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px]">PREMIUM PARTNER</div>}
              {airline.is_new && <div className="bg-surface-container-high dark:bg-primary-container text-on-surface-variant dark:text-outline-variant px-3 py-1 rounded-full font-label-caps text-[10px]">NEW CONTRACT</div>}
            </div>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-base text-primary dark:text-white">{airline.name}</h3>
            <div className="space-y-base mb-stack-md flex-grow">
              <div className="flex justify-between">
                <span className="text-on-surface-variant dark:text-outline-variant text-body-sm">B2B Commission</span>
                <span className="font-bold text-secondary dark:text-secondary-fixed text-body-sm">{airline.commission}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 dark:border-outline/20 pt-base">
                <span className="text-on-surface-variant dark:text-outline-variant text-body-sm">Alliance</span>
                <span className="text-on-surface dark:text-inverse-on-surface text-body-sm">{airline.alliance}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 dark:border-outline/20 pt-base">
                <span className="text-on-surface-variant dark:text-outline-variant text-body-sm">Route Focus</span>
                <span className="text-on-surface dark:text-inverse-on-surface text-body-sm">{airline.route_focus}</span>
              </div>
            </div>
            <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button className="w-full bg-primary dark:bg-secondary text-white py-3 rounded font-semibold text-body-sm">View Private Fares</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default AirlinePortal;
