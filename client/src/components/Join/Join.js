import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import './Join.css';

export default function SignIn() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name || !password) return setError("Please fill all fields");
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, { name, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      // Navigate to chat
      navigate(`/chat?name=${name}`);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel">
        <h1 className="heading">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        
        {error && <p style={{color: 'var(--danger-color)', marginBottom: '15px'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Username" 
            className="input-field" 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)} 
          />
          <input 
            placeholder="Password" 
            className="input-field" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button className="btn" type="submit">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button 
          className="btn btn-secondary" 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
