import React, { useState } from 'react';
import { Link } from "react-router-dom";

import './Join.css';

export default function SignIn() {
  const [name, setName] = useState('');

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Welcome to DirectChat</h1>
        <p className="subheading">Enter your name to connect.</p>
        <div>
          <input 
            placeholder="Your Name" 
            className="joinInput" 
            type="text" 
            onChange={(event) => setName(event.target.value)} 
            onKeyPress={event => event.key === 'Enter' ? (!name ? null : document.getElementById('joinBtn').click()) : null}
          />
        </div>
        <Link onClick={e => (!name) ? e.preventDefault() : null} to={`/chat?name=${name}`}>
          <button id="joinBtn" className="button mt-20" type="submit">Sign In</button>
        </Link>
      </div>
    </div>
  );
}
