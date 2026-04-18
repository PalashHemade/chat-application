import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiImage } from 'react-icons/fi';

export default function Gallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  // Extract user parameters from window.location instead of useParams because router might be simpler or we use query params
  // Actually, App.js has `/gallery/:user1/:user2`, so we can use react-router-dom's useParams
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if(!currentUser) return navigate('/');
    
    // We parse the URL normally because we used <Route path="/gallery/:user1/:user2" />
    const urlParts = window.location.pathname.split('/');
    const user1 = urlParts[2];
    const user2 = urlParts[3];

    axios.get(`http://localhost:5000/api/gallery/${user1}/${user2}`)
      .then(res => {
        setImages(res.data);
      }).catch(console.error);
  }, [navigate, currentUser]);

  return (
    <div className="page-container">
      <div className="glass-panel" style={{ width: '80%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} style={{ marginRight: '10px' }} />
          <h3>Back to Chat</h3>
        </div>
        
        <h1 className="heading" style={{ marginBottom: '20px', textAlign: 'left' }}>
          <FiImage style={{ marginRight: '10px' }} />
          Media Gallery
        </h1>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          {images.length > 0 ? images.map(msg => (
            <div key={msg._id} style={{ 
              borderRadius: '8px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              background: 'var(--bg-color)',
              height: '200px'
            }}>
              <img 
                src={msg.mediaBase64} 
                alt="Shared media" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              <FiImage size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
              <p>No images shared in this conversation yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
