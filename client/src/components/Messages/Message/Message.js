import React from 'react';
import ReactEmoji from 'react-emoji';
import { FiCheck, FiCheckCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './Message.css';

const Message = ({ message: { _id, text, sender, createdAt, status, mediaBase64, isDeleted, isEdited }, name, onDelete, onEdit }) => {
  let isSentByCurrentUser = false;
  const trimmedName = name.trim().toLowerCase();
  
  if(sender && sender.trim().toLowerCase() === trimmedName) {
    isSentByCurrentUser = true;
  }

  const timeString = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if(isDeleted) {
    return (
      <div className={`messageContainer ${isSentByCurrentUser ? 'justifyEnd' : 'justifyStart'}`}>
        <div className="messageBox" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>🚫 This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`messageContainer ${isSentByCurrentUser ? 'justifyEnd' : 'justifyStart'}`}>
      <div className={`messageBox ${isSentByCurrentUser ? 'backgroundPrimary' : 'backgroundSecondary'}`}>
        {mediaBase64 && (
          <img src={mediaBase64} alt="Shared media" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', marginBottom: '10px' }} />
        )}
        {text && <p className={`messageText ${isSentByCurrentUser ? 'colorWhite' : 'colorDark'}`}>{ReactEmoji.emojify(text || '')}</p>}
        
        <div className="messageFooter" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '0.75rem', opacity: 0.8, color: isSentByCurrentUser ? 'var(--text-sent)' : 'var(--text-secondary)' }}>
          {isEdited && <span style={{ fontStyle: 'italic', marginRight: '5px' }}>edited</span>}
          <span className="timestamp">{timeString}</span>
          {isSentByCurrentUser && (
            <span className="statusIcon">
              {status === 'read' ? <FiCheckCircle size={14} color="#6246ea" /> : <FiCheck size={14} />}
            </span>
          )}
        </div>
      </div>
      
      {isSentByCurrentUser && (
        <div className="messageActions" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '5px', opacity: 0 }}>
          <FiEdit2 className="actionIcon" size={14} onClick={() => onEdit(_id, text)} />
          <FiTrash2 className="actionIcon" size={14} onClick={() => onDelete(_id)} color="var(--danger-color)"/>
        </div>
      )}
    </div>
  );
}

export default Message;