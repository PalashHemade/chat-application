import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!localUser) return navigate('/');
    setUser(localUser);
  }, [navigate]);

  const toggleTheme = async () => {
    const newTheme = user.themePreference === 'dark' ? 'light' : 'dark';
    
    // update locally
    const updatedUser = { ...user, themePreference: newTheme };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // apply class
    if (newTheme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');

    // persist
    await axios.put(`http://localhost:5000/api/users/profile/${user.name}`, { 
      themePreference: newTheme 
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/');
  };

  if(!user) return null;

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} style={{ marginRight: '10px' }} />
          <h3>Back</h3>
        </div>
        
        <h1 className="heading" style={{ marginBottom: '30px' }}>Settings</h1>
        
        <div 
          onClick={toggleTheme}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '20px', background: 'var(--bg-color)', 
            borderRadius: '12px', cursor: 'pointer', marginBottom: '15px',
            border: '1px solid var(--border-color)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user.themePreference === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
            <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Dark Mode</span>
          </div>
          <div style={{ 
            width: '40px', height: '24px', background: user.themePreference === 'dark' ? 'var(--accent-color)' : '#ccc',
            borderRadius: '12px', position: 'relative', transition: '0.3s'
          }}>
            <div style={{
              width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
              position: 'absolute', top: '2px', left: user.themePreference === 'dark' ? '18px' : '2px',
              transition: '0.3s'
            }} />
          </div>
        </div>

        <button 
          onClick={logout}
          style={{ 
            width: '100%', padding: '20px', background: 'var(--danger-color)', color: '#fff',
            border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '30px'
          }}>
          <FiLogOut size={20} /> Log Out
        </button>

      </div>
    </div>
  );
}
