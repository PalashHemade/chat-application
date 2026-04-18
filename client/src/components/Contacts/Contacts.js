import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiUserPlus, FiSearch } from 'react-icons/fi';

export default function Contacts() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if(!currentUser) navigate('/');
  }, [currentUser, navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!query) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/search/${query}`);
      setResults(data.filter(u => u.name !== currentUser.name)); // hide self
    } catch (err) {
      console.error(err);
    }
  };

  const addContact = async (contactName) => {
    try {
      await axios.post('http://localhost:5000/api/users/contact', {
        userName: currentUser.name,
        contactName
      });
      alert(`Added ${contactName} to your contacts!`);
    } catch (err) {
      alert('Error adding contact');
    }
  };

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '500px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} style={{ marginRight: '10px' }} />
          <h3>Back to Chat</h3>
        </div>
        
        <h1 className="heading" style={{ marginBottom: '10px' }}>Discover Users</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            className="input-field" 
            style={{ marginBottom: '0' }}
            placeholder="Search by username..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)} 
          />
          <button className="btn" style={{ width: 'auto' }} type="submit"><FiSearch size={20} /></button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', textAlign: 'left' }}>
          {results.length > 0 ? results.map(u => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random&size=50`} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0 }}>{u.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.bio || 'New user'}</span>
                </div>
              </div>
              <button 
                onClick={() => addContact(u.name)}
                style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <FiUserPlus size={18} />
              </button>
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
