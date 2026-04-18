import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCamera, FiCheck } from 'react-icons/fi';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!localUser) return navigate('/');
    
    axios.get(`http://localhost:5000/api/users/profile/${localUser.name}`)
      .then(res => {
        setUser(res.data);
        setBio(res.data.bio || '');
        setAvatar(res.data.avatar || '');
        if(res.data.themePreference === 'dark') document.body.classList.add('dark-theme');
      });
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/profile/${user.name}`, { bio, avatar, themePreference: user.themePreference });
      alert('Profile updated successfully!');
    } catch(err) {
      alert('Failed to update');
    }
  };

  if(!user) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} style={{ marginRight: '10px' }} />
          <h3>Back</h3>
        </div>
        
        <h1 className="heading" style={{ marginBottom: '10px' }}>Profile</h1>
        
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
          <img 
            src={avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`} 
            alt="avatar" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)' }} 
          />
          <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-color)', color: '#fff', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}>
            <FiCamera size={18} />
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <h2 style={{ marginBottom: '20px' }}>{user.name}</h2>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>About you</label>
          <textarea 
            className="input-field" 
            rows="3" 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Hey there! I am using DirectChat."
            style={{ resize: 'none' }}
          />
        </div>

        <button className="btn" onClick={handleSave}>
          <FiCheck size={20} /> Save Changes
        </button>
      </div>
    </div>
  );
}
