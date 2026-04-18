import React from 'react';

import Chat from './components/Chat/Chat';
import Join from './components/Join/Join';
import Profile from './components/Profile/Profile';
import Contacts from './components/Contacts/Contacts';
import Settings from './components/Settings/Settings';
import CreateGroup from './components/GroupAdmin/CreateGroup';
import Gallery from './components/Gallery/Gallery';
import './index.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/gallery/:user1/:user2" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App;
