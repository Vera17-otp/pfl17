import React, { useState, useEffect } from "react";
import { FaCog, FaHotel } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Details() {
    const { profile, user } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("UTC +7:00 (WIB)");

    // System settings
    const [hotelName, setHotelName] = useState("Hotelify Grand");
    const [contactEmail, setContactEmail] = useState("info@hotelify.com");
    const [loadingSettings, setLoadingSettings] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setEmail(profile.email || user?.email || "");
        }
    }, [profile, user]);

    useEffect(() => {
        if (profile?.role === 'admin') {
            const fetchSettings = async () => {
                setLoadingSettings(true);
                const { data, error } = await supabase.from('hotel_settings').select('*');
                if (!error && data) {
                    const hName = data.find(s => s.setting_key === 'hotel_name');
                    if (hName) setHotelName(hName.setting_value.value || "Hotelify Grand");
                    
                    const cEmail = data.find(s => s.setting_key === 'contact_email');
                    if (cEmail) setContactEmail(cEmail.setting_value.value || "info@hotelify.com");
                }
                setLoadingSettings(false);
            };
            fetchSettings();
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile) return;
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    email: email
                })
                .eq("id", profile.id);
            if (error) throw error;

            // Save System Settings if admin
            if (profile.role === 'admin') {
                const settingsToSave = [
                    { setting_key: 'hotel_name', setting_value: { value: hotelName }, is_public: true, updated_by: profile.id },
                    { setting_key: 'contact_email', setting_value: { value: contactEmail }, is_public: true, updated_by: profile.id }
                ];
                const { error: settingsError } = await supabase.from('hotel_settings').upsert(settingsToSave, { onConflict: 'setting_key' });
                if (settingsError) throw settingsError;
            }

            alert("Pengaturan berhasil disimpan!");
        } catch (err) {
            console.error("Gagal menyimpan pengaturan:", err);
            alert("Gagal menyimpan pengaturan: " + err.message);
        }
    };

    const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "AD";

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Settings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure your hotel dashboard settings.</p>
                </div>
                <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaCog /> Save Changes</button>
            </div>

            <div className="dashboard-grid">
                <div style={{ gridColumn: 'span 8' }} className="table-card">
                    <div className="table-header">
                        <span className="table-title">General Settings</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Contact Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Timezone</label>
                            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--surface-color)', color: 'var(--text-main)' }}>
                                <option>UTC -8:00 (Pacific Time)</option>
                                <option>UTC +0:00 (GMT)</option>
                                <option>UTC +7:00 (WIB)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {profile?.role === 'admin' && (
                <div style={{ gridColumn: 'span 8' }} className="table-card">
                    <div className="table-header">
                        <span className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaHotel style={{ color: 'var(--primary-color)' }} /> System Configuration</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                        {loadingSettings ? <p>Memuat pengaturan sistem...</p> : (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Hotel Name</label>
                                    <input type="text" value={hotelName} onChange={e => setHotelName(e.target.value)} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>System Contact Email</label>
                                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                )}

                <div style={{ gridColumn: 'span 4' }} className="table-card">
                    <div className="table-header">
                        <span className="table-title">Profile</span>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', marginBottom: '16px' }}>{initials}</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{fullName || "User"}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{profile?.role || "Staf"}</p>
                        
                        <button style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500 }}>Upload New Photo</button>
                    </div>
                </div>
            </div>
        </div>
    );
}