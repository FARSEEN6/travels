import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import TicketsAdminView from '../components/TicketsAdminView';
import AllTicketsAdminView from '../components/AllTicketsAdminView';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('destinations');
  const [destData, setDestData] = useState({ city: '', code: '', country: '', airport_name: '', price: '', category: 'INTERNATIONAL', image_url: '' });
  const [editingDestId, setEditingDestId] = useState(null);
  const [showDestForm, setShowDestForm] = useState(false);
  const [airlineData, setAirlineData] = useState({ name: '', logo_url: '' });
  const [loading, setLoading] = useState(false);
  const [existingDestinations, setExistingDestinations] = useState([]);
  
  // Ticket System State
  const [selectedDestinationForTickets, setSelectedDestinationForTickets] = useState(null);

  React.useEffect(() => {
    if (activeSection === 'destinations') {
      fetchDestinations();
    }
  }, [activeSection]);

  const fetchDestinations = async () => {
    const { data, error } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });
    if (data) setExistingDestinations(data);
  };

  const handleDeleteDest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) {
      alert("Error deleting: " + error.message + " (Check your Supabase RLS policies!)");
    } else {
      fetchDestinations(); // Refresh list
    }
  };

  const handleEditDest = (dest) => {
    setDestData({
      city: dest.city || '',
      code: dest.code || '',
      country: dest.country || '',
      airport_name: dest.airport_name || '',
      price: dest.price || '',
      category: dest.category || 'INTERNATIONAL',
      image_url: dest.image_url || ''
    });
    setEditingDestId(dest.id);
    setShowDestForm(true);
  };
  
  const cancelEdit = () => {
    setDestData({ city: '', code: '', country: '', airport_name: '', price: '', category: 'INTERNATIONAL', image_url: '' });
    setEditingDestId(null);
    setShowDestForm(false);
  };

  const handleDestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Auto-fill hidden fields based on country to satisfy database requirements
        const finalDestData = {
          ...destData,
          city: destData.country,
          code: destData.country.substring(0, 3).toUpperCase(),
          airport_name: destData.country + ' Airport'
        };

        if (editingDestId) {
          const { error } = await supabase.from('destinations').update(finalDestData).eq('id', editingDestId);
          if (error) throw error;
          alert("Destination updated successfully!");
          setEditingDestId(null);
        } else {
          const { error } = await supabase.from('destinations').insert([finalDestData]);
          if (error) throw error;
          alert("Destination saved successfully to Supabase!");
        }
        setDestData({ city: '', code: '', country: '', airport_name: '', price: '', category: 'INTERNATIONAL', image_url: '' });
        setShowDestForm(false);
        fetchDestinations(); // Refresh list
    } catch (error) {
        alert("Error saving destination: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleAirlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.from('airline_partners').insert([airlineData]);
        if (error) throw error;
        alert("Airline Partner saved successfully to Supabase!");
        setAirlineData({ name: '', logo_url: '' });
    } catch (error) {
        alert("Error saving airline: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setAirlineData({...airlineData, logo_url: data.secure_url});
        alert("Logo uploaded to Cloudinary successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      alert("Error uploading to Cloudinary: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-section bg-surface-container-low dark:bg-inverse-surface min-h-[800px] flex flex-col md:flex-row flex-grow w-full">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-72 bg-white dark:bg-on-primary-fixed border-r border-outline-variant dark:border-outline p-6 flex flex-col gap-2 min-h-full">
        <h2 className="font-headline-lg text-primary dark:text-secondary-fixed mb-8 tracking-tight">Admin Console</h2>
        <button 
          onClick={() => setActiveSection('dashboard')} 
          className={`text-left font-bold px-4 py-3 rounded-xl hover:bg-surface-container-highest dark:hover:bg-primary-container flex items-center gap-3 transition-colors active:scale-[0.98] ${activeSection === 'dashboard' ? 'bg-surface-container-highest dark:bg-primary-container text-primary dark:text-secondary-fixed' : 'text-on-surface dark:text-inverse-on-surface'}`}
        >
          <span className="material-symbols-outlined text-outline">dashboard</span> Dashboard
        </button>
        <button 
          onClick={() => setActiveSection('destinations')} 
          className={`text-left font-bold px-4 py-3 rounded-xl hover:bg-surface-container-highest dark:hover:bg-primary-container flex items-center gap-3 transition-colors active:scale-[0.98] ${activeSection === 'destinations' ? 'bg-surface-container-highest dark:bg-primary-container text-primary dark:text-secondary-fixed' : 'text-on-surface dark:text-inverse-on-surface'}`}
        >
          <span className="material-symbols-outlined text-outline">map</span> Destinations
        </button>
        <button 
          onClick={() => setActiveSection('airlines')} 
          className={`text-left font-bold px-4 py-3 rounded-xl hover:bg-surface-container-highest dark:hover:bg-primary-container flex items-center gap-3 transition-colors active:scale-[0.98] ${activeSection === 'airlines' ? 'bg-surface-container-highest dark:bg-primary-container text-primary dark:text-secondary-fixed' : 'text-on-surface dark:text-inverse-on-surface'}`}
        >
          <span className="material-symbols-outlined text-outline">airlines</span> Airlines
        </button>
        <button 
          onClick={() => { setActiveSection('all_tickets'); setSelectedDestinationForTickets(null); }} 
          className={`text-left font-bold px-4 py-3 rounded-xl hover:bg-surface-container-highest dark:hover:bg-primary-container flex items-center gap-3 transition-colors active:scale-[0.98] ${activeSection === 'all_tickets' ? 'bg-surface-container-highest dark:bg-primary-container text-primary dark:text-secondary-fixed' : 'text-on-surface dark:text-inverse-on-surface'}`}
        >
          <span className="material-symbols-outlined text-outline">confirmation_number</span> All Tickets
        </button>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-grow p-8 md:p-12">
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-6">Dashboard Overview</h2>
            <p className="text-on-surface-variant dark:text-outline-variant">Welcome to the Aashmi Admin Portal. Select a module on the left to manage platform data.</p>
          </div>
        )}

        {activeSection === 'all_tickets' && (
           <AllTicketsAdminView />
        )}

        {activeSection === 'destinations' && selectedDestinationForTickets && (
           <TicketsAdminView destination={selectedDestinationForTickets} goBack={() => setSelectedDestinationForTickets(null)} />
        )}

        {activeSection === 'destinations' && !selectedDestinationForTickets && (
          <div className="flex flex-col gap-8">
            {!showDestForm ? (
              <div className="w-full bg-white dark:bg-inverse-surface p-8 rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30 flex flex-col min-h-[600px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-2">Manage Destinations</h3>
                    <p className="text-body-sm text-outline dark:text-outline-variant">View and manage destinations from your database.</p>
                  </div>
                  <button 
                    onClick={() => setShowDestForm(true)}
                    className="bg-primary dark:bg-secondary text-white dark:text-on-secondary px-6 py-3.5 rounded-xl font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined">add</span> ADD NEW
                  </button>
                </div>
                
                <div className="overflow-y-auto pr-2 scrollbar-thin flex-grow space-y-3">
                  {existingDestinations.length === 0 ? (
                    <p className="text-on-surface-variant text-center py-8">No destinations found.</p>
                  ) : (
                    existingDestinations.map(dest => (
                      <div key={dest.id} className="flex justify-between items-center p-4 rounded-lg border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">
                        <div>
                          <p className="font-bold text-primary dark:text-white flex items-center gap-2">
                            {dest.country} <span className="bg-surface-container-highest dark:bg-primary-container text-[10px] px-2 py-0.5 rounded text-outline uppercase">{dest.category}</span>
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setSelectedDestinationForTickets(dest)}
                            className="material-symbols-outlined text-secondary hover:bg-secondary/10 p-2 rounded-full transition-colors"
                            title="Manage Tickets"
                          >
                            local_activity
                          </button>
                          <button 
                            onClick={() => handleEditDest(dest)}
                            className="material-symbols-outlined text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                            title="Edit Destination"
                          >
                            edit
                          </button>
                          <button 
                            onClick={() => handleDeleteDest(dest.id)}
                            className="material-symbols-outlined text-error hover:bg-error/10 p-2 rounded-full transition-colors"
                            title="Delete Destination"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto bg-white dark:bg-inverse-surface p-8 rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30 relative">
                <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-2">
                  {editingDestId ? 'Edit Destination' : 'Add Destination DB'}
                </h3>
                <p className="text-body-sm text-outline dark:text-outline-variant mb-8">
                  {editingDestId ? 'Update details for this destination.' : 'Add a new destination city that users can fly to.'}
                </p>
                
                <button type="button" onClick={cancelEdit} className="absolute top-8 right-8 text-error text-label-caps font-bold hover:underline">
                  Cancel
                </button>
              
              <form onSubmit={handleDestSubmit} className="flex flex-col gap-5">
                <div className="mb-5">
                    <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1.5">Country</label>
                    <select required value={destData.country} onChange={(e) => setDestData({...destData, country: e.target.value})} className="w-full bg-surface-container-low dark:bg-primary-container border border-outline-variant dark:border-outline rounded-xl p-3 focus:ring-2 focus:ring-primary dark:focus:ring-secondary-fixed font-medium text-primary dark:text-white transition-all">
                      <option value="" disabled>Select Country</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="UAE">UAE</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Oman">Oman</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                    </select>
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1.5">Category</label>
                  <select value={destData.category} onChange={(e) => setDestData({...destData, category: e.target.value})} className="w-full bg-surface-container-low dark:bg-primary-container border border-outline-variant dark:border-outline rounded-xl p-3 focus:ring-2 focus:ring-primary dark:focus:ring-secondary-fixed font-medium text-primary dark:text-white transition-all">
                    <option value="INTERNATIONAL">International</option>
                    <option value="DOMESTIC">Domestic</option>
                  </select>
                </div>

                <button disabled={loading} type="submit" className="mt-4 w-full py-4 bg-primary dark:bg-secondary text-white dark:text-on-secondary rounded-xl font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50">
                  {loading ? 'SAVING...' : (editingDestId ? 'UPDATE DESTINATION' : 'SAVE DESTINATION')}
                </button>
              </form>
              </div>
            )}
          </div>
        )}

        {activeSection === 'airlines' && (
          <div className="max-w-2xl bg-white dark:bg-inverse-surface p-8 rounded-xl shadow-sm border border-outline-variant/30 dark:border-outline/30">
            <h3 className="font-headline-lg-mobile font-bold text-primary dark:text-secondary-fixed mb-2">Add Airline Partner</h3>
            <p className="text-body-sm text-outline dark:text-outline-variant mb-8">Add a B2B airline partner to the portal.</p>
            
            <form onSubmit={handleAirlineSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1.5">Airline Name</label>
                <input required type="text" value={airlineData.name} onChange={(e) => setAirlineData({...airlineData, name: e.target.value})} placeholder="e.g. Emirates" className="w-full bg-surface-container-low dark:bg-primary-container border border-outline-variant dark:border-outline rounded-xl p-3 focus:ring-2 focus:ring-primary dark:focus:ring-secondary-fixed font-medium text-primary dark:text-white transition-all"/>
              </div>

              <div className="flex flex-col gap-4">
                <label className="block text-[10px] font-bold tracking-widest text-outline dark:text-outline-variant uppercase mb-1.5">Airline Logo</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <p className="text-xs text-outline mb-2 font-medium">Option 1: Paste URL</p>
                      <input type="url" value={airlineData.logo_url} onChange={(e) => setAirlineData({...airlineData, logo_url: e.target.value})} placeholder="https://..." className="w-full bg-surface-container-low dark:bg-primary-container border border-outline-variant dark:border-outline rounded-xl p-3 focus:ring-2 focus:ring-primary dark:focus:ring-secondary-fixed font-medium text-primary dark:text-white transition-all"/>
                    </div>
                    
                    <div>
                      <p className="text-xs text-outline mb-2 font-medium">Option 2: Upload File</p>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full bg-surface-container-low dark:bg-primary-container border border-outline-variant dark:border-outline rounded-xl p-2.5 focus:ring-2 focus:ring-primary dark:focus:ring-secondary-fixed font-medium text-primary dark:text-white transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </div>
                </div>

                {airlineData.logo_url && (
                    <div className="mt-2 p-4 border border-outline-variant rounded-xl bg-surface-container-lowest max-w-[200px]">
                        <p className="text-[10px] font-bold tracking-widest text-outline uppercase mb-2">Logo Preview</p>
                        <img src={airlineData.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                    </div>
                )}
              </div>

              <button disabled={loading} type="submit" className="mt-4 w-full py-4 bg-primary dark:bg-secondary text-white dark:text-on-secondary rounded-xl font-bold tracking-widest text-label-caps hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50">
                {loading ? 'SAVING...' : 'SAVE AIRLINE PARTNER'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
