import React, { useState, useEffect, useRef } from "react";
import queryString from 'query-string';
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Messages from '../Messages/Messages';
import Input from '../Input/Input';

import './Chat.css';

const ENDPOINT = 'http://localhost:5000';

const Chat = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Use a ref to persist the socket across React UI renders
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Get username from query parameters
    const { name: userName } = queryString.parse(location.search);
    setName(userName);

    // 2. Initialize Socket.io only once
    socketRef.current = io(ENDPOINT);
    const socket = socketRef.current;

    // 3. Connect to server
    socket.emit('join', { name: userName }, (error) => {
      if(error) alert(error);
    });

    // 4. Setup message receiver
    socket.on('message', (incomingMessage) => {
      setMessages(msgs => [ ...msgs, incomingMessage ]);
    });
    
    // 5. Setup room/online data receiver
    socket.on("roomData", ({ users: serverUsers }) => {
      setOnlineUsers(serverUsers);
      setUsers(serverUsers.filter(u => u.name !== userName)); // Properly filter self out
    });

    // 6. Fetch initial active users list
    const fetchInitialUsers = async () => {
      try {
        const res = await axios.get(`${ENDPOINT}/api/users`);
        setUsers(res.data.filter(u => u.name !== userName)); 
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialUsers();

    // 7. Cleanup on unmount or URL change
    return () => {
      if (socket) {
        socket.off('message');
        socket.off('roomData');
        socket.disconnect();
      }
    };
  }, [location.search]);

  // Fetch messages when selected user changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !name) return;
      try {
        const res = await axios.get(`${ENDPOINT}/api/messages/${name}/${selectedUser.name}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchMessages();
  }, [selectedUser, name]);

  const sendMessage = (event) => {
    event.preventDefault();
    if(message && selectedUser && socketRef.current) {
      socketRef.current.emit('sendMessage', { receiver: selectedUser.name, text: message }, () => setMessage(''));
    }
  }

  // Filter messages to only show ones between current user and selected user
  const displayMessages = messages.filter(m => 
    (m.sender === name && m.receiver === selectedUser?.name) || 
    (m.sender === selectedUser?.name && m.receiver === name)
  );

  return (
    <div className="outerContainer">
      <div className="appContainer">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebarHeader">
            <h2>Chats</h2>
            <div className="currentUserInfo">
              <div className="onlineIndicator active"></div>
              <span>{name}</span>
            </div>
          </div>
          <div className="userList">
            {users.map(user => (
              <div 
                key={user._id} 
                className={`userItem ${selectedUser?.name === user.name ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="userAvatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="userInfo">
                  <div className="userName">{user.name}</div>
                  {user.isOnline && <div className="onlineText">Online</div>}
                </div>
                {user.isOnline && <div className="onlineIndicator active"></div>}
              </div>
            ))}
            {users.length === 0 && <div className="noUsers">No other users registered.</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chatArea">
          {selectedUser ? (
            <>
              <div className="chatHeader">
                <div className="userAvatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
                <div className="chatHeaderInfo">
                  <h3>{selectedUser.name}</h3>
                  <span>{selectedUser.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <Messages messages={displayMessages} name={name} />
              <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </>
          ) : (
            <div className="noChatSelected">
              <div className="placeholderIcon">💬</div>
              <h2>Welcome to DirectChat</h2>
              <p>Select a user from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
