import React from 'react';

import './Message.css';

import ReactEmoji from 'react-emoji';

const Message = ({ message: { text, sender, createdAt }, name }) => {
  let isSentByCurrentUser = false;

  const trimmedName = name.trim().toLowerCase();

  if(sender && sender.trim().toLowerCase() === trimmedName) {
    isSentByCurrentUser = true;
  }

  const timeString = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    isSentByCurrentUser
      ? (
        <div className="messageContainer justifyEnd">
          <div className="messageBox backgroundGreen">
            <p className="messageText colorWhite">{ReactEmoji.emojify(text || '')}</p>
            <span className="timestamp">{timeString}</span>
          </div>
        </div>
        )
        : (
          <div className="messageContainer justifyStart">
            <div className="messageBox backgroundGray">
              <p className="messageText colorWhite">{ReactEmoji.emojify(text || '')}</p>
              <span className="timestamp">{timeString}</span>
            </div>
          </div>
        )
  );
}

export default Message;