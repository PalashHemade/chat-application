import React, { useRef } from 'react';
import { FiImage, FiSend } from 'react-icons/fi';
import './Input.css';

const Input = ({ setMessage, sendMessage, message, handleImageUpload, handleTyping }) => {
  const fileInputRef = useRef();

  return (
    <form className="form" onSubmit={e => sendMessage(e)}>
      <button type="button" className="attachButton" onClick={() => fileInputRef.current.click()}>
        <FiImage size={24} />
      </button>
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
      />
      <input
        className="input-field"
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={({ target: { value } }) => {
          setMessage(value);
          handleTyping();
        }}
        onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
        style={{ marginBottom: 0, border: 'none', background: 'transparent', flex: 1 }}
      />
      <button className="sendButton" type="submit"><FiSend size={20} /></button>
    </form>
  )
}

export default Input;