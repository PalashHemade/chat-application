import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiUser, FiSettings, FiSearch, FiUsers, FiImage } from "react-icons/fi";

import Messages from '../Messages/Messages';
import Input from '../Input/Input';

import './Chat.css';

const ENDPOINT = 'http://localhost:5000';

const Chat = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!localUser) return navigate('/');
    setCurrentUser(localUser);

    if (localUser.themePreference === 'dark') document.body.classList.add('dark-theme');

    socketRef.current = io(ENDPOINT);
    const socket = socketRef.current;

    socket.emit('join', { name: localUser.name }, (error) => {
      if(error) alert(error);
    });

    socket.on('message', (incomingMessage) => {
      setMessages(msgs => [ ...msgs, incomingMessage ]);
      
      // Handle Unread Counts
      if (incomingMessage.sender !== localUser.name) {
        // If we are currently talking to this user, mark it read immediately
        // Unfortunately within this closure selectedUser might be stale without a functional updater or useRef,
        // but we can rely on marking read when they click the chat.
        // For simplicity we use the functional state updater
        setUnreadCounts(prev => {
          // If we can't reliably check selectedUser here easily, we just blindly increment,
          // then the useEffect that listens to selectedUser clears it.
          const counts = { ...prev };
          counts[incomingMessage.sender] = (counts[incomingMessage.sender] || 0) + 1;
          return counts;
        });
      }
    });

    socket.on("roomData", ({ users: serverUsers }) => {
      setOnlineUsers(serverUsers);
      setUsers(serverUsers.filter(u => u.name !== localUser.name));
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages(msgs => msgs.map(m => m._id === messageId ? { ...m, isDeleted: true } : m));
    });

    socket.on("messageEdited", ({ message }) => {
      setMessages(msgs => msgs.map(m => m._id === message._id ? { ...m, text: message.text, isEdited: true } : m));
    });

    socket.on("messagesRead", () => {
      setMessages(msgs => msgs.map(m => ({ ...m, status: 'read' })));
    });

    axios.get(`${ENDPOINT}/api/users/profile/${localUser.name}`).then(res => {
      // In a real app we might only show contacts, let's keep all users for simplicity here
      axios.get(`${ENDPOINT}/api/users`).then(allRes => setUsers(allRes.data.filter(u => u.name !== localUser.name)));
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (!selectedUser || !currentUser || !socketRef.current) return;
    
    // Clear unread count when switching users
    setUnreadCounts(prev => ({ ...prev, [selectedUser.name]: 0 }));
    
    // Emit mark as read
    socketRef.current.emit('markAsRead', { sender: selectedUser.name });
    
    axios.get(`${ENDPOINT}/api/messages/${currentUser.name}/${selectedUser.name}`)
      .then(res => setMessages(res.data))
      .catch(console.error);
      
  }, [selectedUser, currentUser]);

  const sendMessage = (event) => {
    event.preventDefault();
    if(message && selectedUser && socketRef.current) {
      socketRef.current.emit('sendMessage', { receiver: selectedUser.name, text: message }, () => setMessage(''));
      socketRef.current.emit('stopTyping', { receiver: selectedUser.name });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file && selectedUser && socketRef.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        socketRef.current.emit('sendMessage', { receiver: selectedUser.name, text: '', mediaBase64: reader.result }, () => {});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTyping = () => {
    if(!socketRef.current || !selectedUser) return;
    socketRef.current.emit('typing', { receiver: selectedUser.name });
    
    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stopTyping', { receiver: selectedUser.name });
    }, 2000);
  };

  const deleteMessage = (id) => {
    if(window.confirm('Delete message?')) socketRef.current.emit('deleteMessage', { messageId: id });
  };

  const editMessage = (id, oldText) => {
    const newText = window.prompt("Edit your message:", oldText);
    if(newText && newText !== oldText) socketRef.current.emit('editMessage', { messageId: id, text: newText });
  };

  if(!currentUser) return null;

  const displayMessages = messages.filter(m => 
    (m.sender === currentUser.name && m.receiver === selectedUser?.name) || 
    (m.sender === selectedUser?.name && m.receiver === currentUser.name)
  );

  return (
    <div className="outerContainer">
      <div className="appContainer" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        
        {/* Sidebar */}
        <div className="sidebar" style={{ background: 'var(--bg-color)', borderRight: '1px solid var(--border-color)' }}>
          <div className="top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random&size=40`} alt="me" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
               <h3 style={{ margin: 0 }}>{currentUser.name}</h3>
            </div>
            <div className="nav-links">
              <Link to="/contacts"><FiSearch className="nav-icon" title="Find Users"/></Link>
              <Link to="/create-group"><FiUsers className="nav-icon" title="Groups"/></Link>
              <Link to="/profile"><FiUser className="nav-icon" title="Profile"/></Link>
              <Link to="/settings"><FiSettings className="nav-icon" title="Settings"/></Link>
            </div>
          </div>
          
          <div className="userList">
            {users.map(user => {
              const isOnline = onlineUsers.some(ou => ou.name === user.name && ou.isOnline);
              const unread = unreadCounts[user.name];
              return (
                <div 
                  key={user._id} 
                  className={`userItem ${selectedUser?.name === user.name ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=40`} alt="avatar" className="userAvatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="userInfo">
                    <div className="userName">{user.name}</div>
                    <div className="onlineText" style={{ fontSize: '0.8rem', color: isOnline ? '#2cb67d' : 'var(--text-secondary)' }}>
                      {isOnline ? 'Active now' : 'Offline'}
                    </div>
                  </div>
                  {unread > 0 && selectedUser?.name !== user.name && (
                    <div style={{ background: 'var(--danger-color)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem' }}>
                      {unread}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chatArea">
          {selectedUser ? (
            <>
              <div className="chatHeader" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random&size=40`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="chatHeaderInfo">
                    <h3 style={{ margin: 0 }}>{selectedUser.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: isTyping ? 'var(--accent-color)' : 'var(--text-secondary)', fontStyle: isTyping ? 'italic' : 'normal' }}>
                      {isTyping ? 'typing...' : (onlineUsers.some(ou => ou.name === selectedUser.name && ou.isOnline) ? 'Online' : 'Offline')}
                    </span>
                  </div>
                </div>
                <Link to={`/gallery/${currentUser.name}/${selectedUser.name}`} style={{ color: 'var(--text-color)' }}>
                  <FiImage size={24} className="nav-icon" title="View Media Gallery" />
                </Link>
              </div>
              <Messages messages={displayMessages} name={currentUser.name} onDelete={deleteMessage} onEdit={editMessage} />
              <Input 
                message={message} 
                setMessage={setMessage} 
                sendMessage={sendMessage} 
                handleImageUpload={handleImageUpload}
                handleTyping={handleTyping}
              />
            </>
          ) : (
            <div className="noChatSelected" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
              <h2>DirectChat</h2>
              <p>Select a beautiful conversation to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
