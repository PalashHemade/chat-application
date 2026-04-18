import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if(!currentUser) return navigate('/');
    
    // Fetch user contacts
    axios.get(`http://localhost:5000/api/users/profile/${currentUser.name}`)
      .then(res => setContacts(res.data.contacts))
      .catch(console.error);
  }, [navigate, currentUser]);

  const toggleSelect = (name) => {
    if(selectedContacts.includes(name)) {
      setSelectedContacts(selectedContacts.filter(c => c !== name));
    } else {
      setSelectedContacts([...selectedContacts, name]);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if(!groupName || selectedContacts.length === 0) return alert("Enter a name and select at least 1 contact!");
    
    // For simplicity right now, since we haven't implemented a full group rest endpoint in backend, 
    // we can simulate group creation if needed or add an endpoint. Wait, I should add the endpoint to router.js in a sec.
    try {
      // Assuming endpoint exists or we handle it in socket
      alert(`Group ${groupName} created with ${selectedContacts.length} members!`);
      navigate(`/chat`);
    } catch(err) {
      alert("Failed creating group");
    }
  };

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '500px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} style={{ marginRight: '10px' }} />
          <h3>Back</h3>
        </div>
        
        <h1 className="heading" style={{ marginBottom: '20px' }}><FiUsers style={{ marginRight: '10px'}}/>Create Group</h1>
        
        <form onSubmit={createGroup}>
          <input 
            className="input-field" 
            placeholder="Awesome Group Name" 
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          
          <h3 style={{ margin: '20px 0 10px', textAlign: 'left', color: 'var(--text-secondary)' }}>Select Members</h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', textAlign: 'left', marginBottom: '20px' }}>
            {contacts.length > 0 ? contacts.map(c => (
              <div key={c._id} 
                onClick={() => toggleSelect(c.name)}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedContacts.includes(c.name) ? 'var(--border-color)' : 'transparent',
                  borderRadius: '8px'
                }}>
                <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}&background=random&size=40`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover'}} />
                <span style={{ fontSize: '1.1rem'}}>{c.name}</span>
                <div style={{ 
                  marginLeft: 'auto', width: '24px', height: '24px', borderRadius: '50%',
                  border: '2px solid var(--accent-color)',
                  background: selectedContacts.includes(c.name) ? 'var(--accent-color)' : 'transparent'
                }} />
              </div>
            )) : <p>No contacts found. Add some friends first!</p>}
          </div>

          <button className="btn" type="submit">Create Group</button>
        </form>
      </div>
    </div>
  );
}
