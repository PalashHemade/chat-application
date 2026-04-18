import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import Message from './Message/Message';
import './Messages.css';

const Messages = ({ messages, name, onDelete, onEdit }) => (
  <ScrollToBottom className="messages">
    {messages.map((message, i) => (
      <div key={message._id || i}>
        <Message message={message} name={name} onDelete={onDelete} onEdit={onEdit} />
      </div>
    ))}
  </ScrollToBottom>
);

export default Messages;