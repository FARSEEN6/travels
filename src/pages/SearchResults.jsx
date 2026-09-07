import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchWidget from '../components/SearchWidget';

const flightsDatabase = [
  { id: 1, airline: 'Air India Express', flightNo: 'IX-1475', from: 'CCJ', to: 'DXB', depTime: '06:45', arrTime: '09:15', duration: '3h 55m', stops: 0, stopDetails: 'Direct', options: [{ name: 'Lite', price: 16739 }, { name: 'Value', price: 17747 }], chips: ['REFUNDABLE', '20 KG', 'MEAL'] },
  { id: 2, airline: 'Oman Air', flightNo: 'WY-298', from: 'CCJ', to: 'DXB', depTime: '08:55', arrTime: '21:25', duration: '14h 00m', stops: 1, stopDetails: 'Via Muscat', options: [{ name: 'Eco Saver', price: 18254 }, { name: 'Eco Comfort', price: 19682 }], chips: ['NON-REFUNDABLE', '30 KG', 'LEGROOM'] },
  { id: 3, airline: 'flynas', flightNo: 'XY-331', from: 'CCJ', to: 'DXB', depTime: '11:15', arrTime: '14:20', duration: '4h 35m', stops: 0, stopDetails: 'Direct', options: [{ name: 'Standard', price: 22150 }, { name: 'Premium', price: 26740 }], chips: ['REFUNDABLE', '25 KG', '2 SEATS LEFT'] },
  { id: 4, airline: 'IndiGo', flightNo: '6E-104', from: 'CCJ', to: 'DXB', depTime: '18:30', arrTime: '21:05', duration: '4h 05m', stops: 0, stopDetails: 'Direct', options: [{ name: 'Saver', price: 15400 }, { name: 'Flexi Plus', price: 17200 }], chips: ['NON-REFUNDABLE', '15 KG', 'MEAL'] },
  { id: 5, airline: 'Emirates', flightNo: 'EK-562', from: 'CCJ', to: 'DXB', depTime: '04:30', arrTime: '06:50', duration: '3h 50m', stops: 0, stopDetails: 'Direct', options: [{ name: 'Special', price: 28900 }, { name: 'Flex', price: 34500 }], chips: ['REFUNDABLE', '30 KG', 'WI-FI', 'LOUNGE'] },
  { id: 6, airline: 'Air India', flightNo: 'AI-937', from: 'CCJ', to: 'DXB', depTime: '10:00', arrTime: '17:35', duration: '8h 05m', stops: 1, stopDetails: 'Via Mumbai', options: [{ name: 'Saver', price: 17300 }, { name: 'Super Value', price: 19800 }], chips: ['REFUNDABLE', '25 KG', 'MEAL'] },
  { id: 7, airline: 'Qatar Airways', flightNo: 'QR-507', from: 'CCJ', to: 'DXB', depTime: '09:10', arrTime: '17:50', duration: '9h 10m', stops: 1, stopDetails: 'Via Doha', options: [{ name: 'Eco Classic', price: 29500 }, { name: 'Eco Convenience', price: 33400 }], chips: ['REFUNDABLE', '30 KG', 'AWARD WINNING'] },
  { id: 8, airline: 'Gulf Air', flightNo: 'GF-69', from: 'CCJ', to: 'DXB', depTime: '17:30', arrTime: '23:45', duration: '6h 45m', stops: 1, stopDetails: 'Via Bahrain', options: [{ name: 'Eco Smart', price: 21250 }, { name: 'Eco Flex', price: 24300 }], chips: ['REFUNDABLE', '30 KG', 'MEAL'] },
];

const recentBookings = [
  { ref: 'FBB8KXCL', date: '09 Jul 2026', from: 'CCJ', to: 'DOH', fromName: 'Kozhikode', toName: 'Doha', status: 'Confirmed', amount: '₹ 20,590.00', airline: 'Qatar Airways', flightNo: 'QR-507', depTime: '09:10', arrTime: '11:25', duration: '4h 45m', class: 'Economy', passenger: 'MOHAMED JESIL', gate: 'Gate 4B', seat: '18C' },
  { ref: 'FBB8KVUO', date: '09 Jul 2026', from: 'CCJ', to: 'DXB', fromName: 'Kozhikode', toName: 'Dubai', status: 'Confirmed', amount: '₹ 14,000.00', airline: 'flynas', flightNo: 'XY-332', depTime: '11:15', arrTime: '14:20', duration: '4h 35m', class: 'Economy', passenger: 'MOHAMED JESIL', gate: 'Gate 2', seat: '22A' },
  { ref: 'FBB8KR1R', date: '08 Jul 2026', from: 'COK', to: 'DXB', fromName: 'Kochi', toName: 'Dubai', status: 'Confirmed', amount: '₹ 15,002.00', airline: 'IndiGo', flightNo: '6E-87', depTime: '18:20', arrTime: '20:55', duration: '4h 05m', class: 'Economy', passenger: 'MOHAMED JESIL', gate: 'Gate 11', seat: '10F' },
  { ref: 'FBB8KP5H', date: '07 Jul 2026', from: 'CCJ', to: 'RUH', fromName: 'Kozhikode', toName: 'Riyadh', status: 'Confirmed', amount: '₹ 12,200.00', airline: 'Air India Express', flightNo: 'IX-373', depTime: '13:05', arrTime: '15:45', duration: '5h 10m', class: 'Economy', passenger: 'MOHAMED JESIL', gate: 'Gate 1', seat: '14D' },
];

const formatPrice = (p) => '₹ ' + p.toLocaleString('en-IN');

const SearchResults = () => {
  const location = useLocation();
  const searchState = location.state || {};
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sort, setSort] = useState('cheapest');

  const sortedFlights = [...flightsDatabase].sort((a, b) => {
    if (sort === 'cheapest') return a.options[0].price - b.options[0].price;
    if (sort === 'fastest') return a.duration.localeCompare(b.duration);
    if (sort === 'earliest') return a.depTime.localeCompare(b.depTime);
    return 0;
  });

  return (
    <div className="view-section flex-grow">
      {/* Hero */}
      <header className="hero-gradient relative pt-20 pb-40 px-margin-desktop">
        <div className="max-w-container-max mx-auto relative z-40 text-center">
          <h1 className="font-headline-xl text-headline-xl text-white mb-stack-sm tracking-tight">Where To Next?</h1>
          <p className="text-on-primary-container font-body-md mb-stack-lg max-w-2xl mx-auto opacity-80">
            Experience luxury at every altitude. Search private fares and exclusive commercial routes with the Aashmi signature concierge service.
          </p>
          <SearchWidget initialFrom={searchState.from || ''} initialTo={searchState.to || ''} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-margin-desktop -mt-20 max-w-container-max mx-auto w-full z-20 pb-stack-lg relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Bookings */}
          <section className="lg:col-span-2 min-w-0" id="recent-bookings-sec">
            <div className="bg-white dark:bg-inverse-surface rounded-xl shadow-sm overflow-hidden border border-outline-variant/30 dark:border-outline/30 flex flex-col">
              <div className="p-6 border-b border-outline-variant/30 dark:border-outline/30 flex justify-between items-center">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed">Recent Bookings</h2>
                <button className="text-secondary dark:text-secondary-fixed font-label-caps text-label-caps hover:underline font-bold">View All History</button>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-surface-container-low dark:bg-primary-container">
                    <tr>
                      <th className="px-6 py-4 font-label-caps text-label-caps text-outline dark:text-outline-variant uppercase">Ref No</th>
                      <th className="px-6 py-4 font-label-caps text-label-caps text-outline dark:text-outline-variant uppercase">Booking Date</th>
                      <th className="px-6 py-4 font-label-caps text-label-caps text-outline dark:text-outline-variant uppercase">Itinerary</th>
                      <th className="px-6 py-4 font-label-caps text-label-caps text-outline dark:text-outline-variant uppercase">Status</th>
                      <th className="px-6 py-4 font-label-caps text-label-caps text-outline dark:text-outline-variant uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 dark:divide-outline/20">
                    {recentBookings.map(b => (
                      <tr key={b.ref} onClick={() => setSelectedBooking(b)} className="hover:bg-surface-container-low/50 dark:hover:bg-primary-container/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-bold text-primary dark:text-white">{b.ref}</td>
                        <td className="px-6 py-4 text-on-surface-variant dark:text-outline-variant font-medium">{b.date}</td>
                        <td className="px-6 py-4 font-bold text-on-surface dark:text-inverse-on-surface">{b.from} → {b.to}</td>
                        <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{b.status}</span></td>
                        <td className="px-6 py-4 text-right font-price-display text-[18px] font-bold text-secondary dark:text-secondary-fixed">{b.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8 min-w-0">
            <div className="bg-white dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30 p-12 text-center h-[320px] flex flex-col items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-6xl text-outline-variant/50 dark:text-outline/50 mb-6">search_off</span>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-outline-variant dark:text-outline-variant mb-2">No Recent Searches</h3>
              <p className="text-body-sm font-body-sm text-outline dark:text-outline-variant">Your recent searches will appear here once you start exploring.</p>
            </div>
            <div className="bg-primary dark:bg-primary-container rounded-xl p-8 text-white relative overflow-hidden group h-[200px] border border-outline/20">
              <div className="relative z-10 flex flex-col h-full justify-between items-start">
                <div>
                  <span className="font-label-caps text-label-caps bg-secondary text-on-secondary px-3 py-1 rounded-full mb-4 inline-block font-bold">Exclusive Offer</span>
                  <h4 className="font-headline-lg-mobile text-headline-lg-mobile mb-2 leading-tight font-bold text-white dark:text-secondary-fixed">Private Fares for Paris</h4>
                  <p className="text-body-sm font-body-sm opacity-80">Book your summer getaway with flat 15% off on business class.</p>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
              </div>
            </div>
          </aside>
        </div>

        {/* ======== FLIGHT RESULTS SECTION ======== */}
        <section className="mt-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-outline-variant dark:border-outline pb-6 mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary dark:text-secondary-fixed font-bold tracking-tight">Available Flights</h2>
              <p className="text-on-surface-variant dark:text-outline-variant font-body-sm">{sortedFlights.length} flights found • CCJ to DXB</p>
            </div>
            <div className="bg-surface-container-low dark:bg-inverse-surface p-1 rounded-full flex border border-outline-variant dark:border-outline">
              {['cheapest', 'fastest', 'earliest'].map(s => (
                <button key={s} onClick={() => setSort(s)} className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps font-bold transition-all ${sort === s ? 'bg-primary dark:bg-secondary text-white' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary'}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {sortedFlights.map(flight => (
              <div key={flight.id} className="bg-white dark:bg-inverse-surface rounded-xl border border-outline-variant/30 dark:border-outline/30 flight-card-shadow hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Airline Info */}
                    <div className="flex items-center gap-3 md:w-44 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low dark:bg-primary-container flex items-center justify-center border border-outline-variant/30">
                        <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-[20px]">flight</span>
                      </div>
                      <div>
                        <p className="font-bold text-body-sm text-on-surface dark:text-inverse-on-surface">{flight.airline}</p>
                        <p className="text-[10px] text-outline dark:text-outline-variant font-bold tracking-wider">{flight.flightNo}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex-grow flex items-center justify-between gap-4">
                      <div className="text-center">
                        <p className="font-headline-lg-mobile text-[22px] font-bold text-primary dark:text-secondary-fixed">{flight.depTime}</p>
                        <p className="text-[11px] text-outline font-bold">{flight.from}</p>
                      </div>
                      <div className="flex-grow flex flex-col items-center px-4">
                        <p className="text-[10px] text-outline dark:text-outline-variant font-bold tracking-wider mb-1">{flight.duration}</p>
                        <div className="w-full flex items-center">
                          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                          <div className="flex-grow border-t-2 border-dashed border-outline-variant/50 dark:border-outline/50 relative">
                            {flight.stops > 0 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-secondary border-2 border-white dark:border-inverse-surface"></div>}
                          </div>
                          <div className="w-2 h-2 rounded-full bg-primary dark:bg-secondary-fixed"></div>
                        </div>
                        <p className="text-[10px] text-outline dark:text-outline-variant mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop · ${flight.stopDetails}`}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-headline-lg-mobile text-[22px] font-bold text-primary dark:text-secondary-fixed">{flight.arrTime}</p>
                        <p className="text-[11px] text-outline font-bold">{flight.to}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right md:w-40 shrink-0 md:border-l md:border-outline-variant/30 md:dark:border-outline/30 md:pl-6">
                      <p className="font-price-display text-price-display text-secondary dark:text-secondary-fixed">{formatPrice(flight.options[0].price)}</p>
                      <p className="text-[10px] text-outline dark:text-outline-variant font-bold tracking-wider mt-0.5">{flight.options[0].name}</p>
                      <button className="mt-3 w-full py-2.5 bg-primary dark:bg-secondary text-white rounded-lg font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all">
                        BOOK NOW
                      </button>
                    </div>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-outline-variant/20 dark:border-outline/20">
                    {flight.chips.map((chip, i) => (
                      <span key={i} className="bg-surface-container-low dark:bg-primary-container text-[9px] font-bold tracking-widest text-on-surface-variant dark:text-outline-variant px-2.5 py-1 rounded-full border border-outline-variant/30 dark:border-outline/30 uppercase">
                        {chip}
                      </span>
                    ))}
                    {flight.options.length > 1 && (
                      <span className="bg-secondary/10 text-secondary dark:text-secondary-fixed text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full border border-secondary/20 uppercase">
                        +{flight.options.length - 1} MORE OPTION
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ======== BOOKING DETAIL DRAWER ======== */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setSelectedBooking(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-surface dark:bg-on-primary-fixed border-l border-outline-variant dark:border-outline shadow-2xl z-[80] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant/30 dark:border-outline/30 flex justify-between items-center bg-white dark:bg-inverse-surface">
              <h3 className="font-headline-lg text-body-md font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider">E-Ticket Summary</h3>
              <button onClick={() => setSelectedBooking(null)} className="material-symbols-outlined p-2 hover:bg-surface-container-low dark:hover:bg-primary-container rounded-full transition-all text-on-surface dark:text-inverse-on-surface">close</button>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-inverse-surface rounded-xl border border-outline-variant/30 dark:border-outline/30 overflow-hidden shadow-sm">
                {/* Ticket Header */}
                <div className="p-6 bg-primary dark:bg-[#0b1c30] text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Airline</p>
                      <p className="font-bold text-body-md mt-1">{selectedBooking.airline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Flight</p>
                      <p className="font-bold text-body-md mt-1">{selectedBooking.flightNo}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center gap-2 mt-6">
                    <div className="col-span-2 text-left">
                      <h2 className="text-[28px] font-bold leading-none">{selectedBooking.from}</h2>
                      <p className="text-[11px] opacity-60 uppercase font-medium mt-1">{selectedBooking.fromName}</p>
                    </div>
                    <div className="col-span-1 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-secondary-fixed">flight_takeoff</span>
                      <div className="w-full border-b border-dashed border-white/30 mt-1"></div>
                    </div>
                    <div className="col-span-2 text-right">
                      <h2 className="text-[28px] font-bold leading-none">{selectedBooking.to}</h2>
                      <p className="text-[11px] opacity-60 uppercase font-medium mt-1">{selectedBooking.toName}</p>
                    </div>
                  </div>
                </div>

                {/* Perforation */}
                <div className="relative flex items-center my-0">
                  <div className="absolute -left-3 w-6 h-6 bg-surface dark:bg-on-primary-fixed rounded-full border-r border-outline-variant/20"></div>
                  <div className="w-full border-t-2 border-dashed border-outline-variant/30 dark:border-outline/30 mx-6"></div>
                  <div className="absolute -right-3 w-6 h-6 bg-surface dark:bg-on-primary-fixed rounded-full border-l border-outline-variant/20"></div>
                </div>

                {/* Details */}
                <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2 text-left text-on-surface dark:text-inverse-on-surface">
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Passenger</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.passenger}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Booking Date</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Status</p>
                    <p className="font-bold text-body-sm text-green-700 dark:text-green-400 mt-1 uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>{selectedBooking.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Class</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.class}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Departure</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.depTime}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Arrival</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.arrTime}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Gate</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.gate}</p>
                  </div>
                  <div>
                    <p className="text-label-caps font-label-caps text-outline dark:text-outline-variant uppercase">Seat</p>
                    <p className="font-bold text-body-md text-primary dark:text-white mt-1">{selectedBooking.seat}</p>
                  </div>
                </div>

                {/* Barcode */}
                <div className="p-6 bg-surface-container-low dark:bg-primary-container flex flex-col items-center gap-4 border-t border-outline-variant/20 dark:border-outline/20">
                  <div className="w-full h-14 bg-gradient-to-r from-primary via-outline to-primary opacity-20 rounded"></div>
                  <p className="text-label-caps font-label-caps text-outline leading-none font-bold">{selectedBooking.ref}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-6">
                <button className="w-full py-4 bg-primary dark:bg-secondary text-white rounded-lg font-bold tracking-widest text-label-caps hover:opacity-90 transition-all flex items-center justify-center gap-2" onClick={() => window.print()}>
                  PRINT E-TICKET <span className="material-symbols-outlined text-[16px]">print</span>
                </button>
                <button className="w-full py-4 border border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface rounded-lg font-bold tracking-widest text-label-caps hover:bg-surface-container-low transition-all">
                  EMAIL PASSENGER
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
