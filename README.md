# DirectChat - Real-Time Dashboard App

A robust, real-time 1-on-1 messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and powered by **Socket.io** for live, instantaneous bidirectional communication. 

## Features
- **Real-Time Live Messaging**: Receive and send messages instantly without refreshing the page.
- **Direct 1-on-1 Chat**: Select users from a sidebar to communicate in private, isolated chat rooms.
- **Persistent Data**: Messages and user accounts are permanently stored in a MongoDB database, allowing you to access chat history at any time.
- **Active Presence (Online/Offline Status)**: See exactly who is online in real-time. Statuses update dynamically across all clients when someone logs in or out.
- **Modern WhatsApp-style UI**: A responsive, clean two-column layout featuring user lists, selected chat focus, and stylized chat bubbles.

---

## 🔌 Focus: Event-Driven Real-Time Architecture

*Note: While occasionally referred to colloquially as "webhooks", this application relies on **WebSockets** (via `Socket.io`) to achieve the real-time server-to-client push mechanisms.*

WebSockets provide a continuous, open connection between the client and the server, rather than relying on HTTP request/response polling. This is the backbone of the application. 

### How the Real-Time Event Flow Works:

1. **Connection & State Initialization (`join` event)**
   When you connect via the React frontend, a WebSocket connection is initialized. The client emits a `join` event to the Node.js server. The server then updates your user record in MongoDB to `{ isOnline: true }`, binds your unique `socket.id` to your profile, and lets you in.
   
2. **Global Broadcasting (`roomData` event)**
   Immediately after a user connects or disconnects, the server uses `io.emit('roomData')` to broadcast the newly updated "Active Users" list to **all** connected clients. This pushes the new state directly to everyone's UI instantly.
   
3. **Targeted Messaging (`message` event)**
   Unlike a group chat where messages are broadcasted to everyone, DirectChat uses targeted Socket routing. 
   - When you send a message, the client emits `sendMessage` with the designated receiver's name.
   - The server catches this, saves it safely into MongoDB (`Message` model), and queries the receiver's profile.
   - If the receiver is actively online, the server explicitly pushes the message *only* to them using: `io.to(receiverUser.socketId).emit('message')`. 

4. **Graceful Disconnection (`disconnect` event)**
   If a user closes their tab or loses internet access, the WebSocket naturally breaks. The server detects the `disconnect` event, updates the database to mark the user `isOnline: false`, and pushes the updated global user list to the remaining active clients.

---

## Architecture & Technology Stack

### Frontend (Client)
- **React.js**: For building the reactive, state-driven user interface.
- **React Router DOM**: Client-side routing to handle the login screen (`/`) vs the central dashboard (`/chat`).
- **Socket.io-client**: The client-side WebSocket API to maintain the bridge to the server.
- **Axios**: HTTP client used for initial data synchronization (fetching the full user list and rendering historical conversation logs before the WebSocket takes over new messages).

### Backend (Server)
- **Node.js & Express**: Framework handling the REST API operations and serving as the foundational HTTP server.
- **Socket.io**: Upgrades the classic HTTP server to allow WebSockets, managing real-time events.
- **MongoDB & Mongoose**: NoSQL database and Object Data Modeling (ODM) library used to structure `Message` and `User` schemas, preserving chat history permanently.

---

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- A local MongoDB instance running (defaulting to `mongodb://127.0.0.1:27017/chat_app`), or a MongoDB Atlas URI securely substituted in `server/index.js`.

### Installation & Execution

This application requires both the server and the client development environments to run concurrently.

1. **Setup and Start the Server**:
   Open a terminal and run the following commands to install backend dependencies and start the Express/Socket API.
   ```bash
   cd server
   npm install
   npm start
   ```
   *The server will typically start on `http://localhost:5000`.*

2. **Setup and Start the Client**:
   Open a second, separate terminal instance to orchestrate the React frontend.
   ```bash
   cd client
   npm install
   npm start
   ```
   *The web app will launch automatically in your browser at `http://localhost:3000`.*

### Project Flow Summary
1. Start at the **Join Screen** and enter a unique username to register/login.
2. The app redirects you to the **Chat Dashboard**, automatically polling previous MongoDB chat history and initiating the Socket connection.
3. Select any user from the left-hand **Active Users Sidebar**.
4. Type in the input field, hit Enter, and watch the event-driven WebSocket magic deliver your message instantly!
