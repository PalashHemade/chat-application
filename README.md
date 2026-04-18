# DirectChat - Advanced Real-Time Messaging Platform

A robust, real-time messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and powered by **Socket.io** for live, instantaneous bidirectional communication. Evolving from a simple 1-on-1 chat, the application is now a feature-rich platform.

## Features

- **Secure User Authentication:** Username and password-based login and registration system. 
- **Direct & Group Chats:** Enjoy private, isolated 1-on-1 conversations or create engaging group chats with multiple users.
- **Media & Avatar Support:** Upload custom profile avatars and share image media seamlessly using Base64 encoding.
- **Typing Indicators & Read Receipts:** Advanced real-time UI elements. See precisely when the other person is typing and know when they have read your messages.
- **Contacts Discovery System:** Find other registered users across the platform effortlessly and initiate conversations.
- **Profile Management:** Fully manage your profile with customizable bios and avatars.
- **Responsive Dark/Light Theme:** A visually stunning, modern, and sleek UI that seamlessly toggles between dark and light modes.
- **Real-Time Live Messaging:** Receive and send both text and media instantly without page reloads.
- **Persistent Data:** Messages, user accounts, groups, and media are safely and permanently stored in MongoDB.
- **Active Presence:** See who is currently online in real-time. Statuses update dynamically across all active clients.

---

## 🔌 System Architecture

The backbone of this application relies on an **Event-Driven Real-Time Architecture** utilizing **WebSockets** (via `Socket.io`), which achieves instant server-to-client push mechanisms rather than relying on standard HTTP polling.

### Key Operational Workflows:

1. **Authentication Verification**
   Users create and access accounts via `POST` REST endpoints (`/register`, `/login`). Once authorized and present in the dashboard, the application prepares to initialize live sockets.

2. **Connection & State Initialization (`join` event)**
   The React frontend initiates the WebSocket. The client emits a `join` event to the Node.js server. The server updates the user's MongoDB record to reflect their online status and binds their unique `socket.id`.

3. **Targeted Delivery (`sendMessage` event)**
   - **Direct Messages:** The client routes a message directly to a target user. The server captures it, securely logs it into the `Message` MongoDB model, and uses `io.to(receiverSocketId).emit('message')` to push the payload only to the intended recipient.
   - **Group Messages:** The system iterates or utilizes Socket.io room capabilities to ensure all active group participants receive the broadcasted message.

4. **Live Interactions (`typing` & `markRead` events)**
   The application intercepts keystrokes and scroll behaviors to emit optimized lightweight events: `typing`, `stopTyping`, and `markAsRead`. These pass through the server directly to the recipient to render visual context updates.

5. **Graceful Disconnection (`disconnect` event)**
   Upon user exit, the WebSocket breaks. The server automatically cascades a `disconnect` signal, updates the user's online status in the database to false, and pushes this visibility change globally to remain visually accurate.

---

## Technology Stack

### Frontend (Client)
- **React.js**: For building the reactive, state-driven user interface.
- **React Router DOM**: Client-side routing to manage navigation seamlessly between Authentication, Dashboard, and Contacts pages.
- **Socket.io-client**: The robust client-side API to sustain the WebSocket connection to the server.
- **Axios**: HTTP client used for complex initialization including establishing the contact lists and querying historic database logs.
- **CSS / Visuals**: Customized responsive layouts capable of handling dynamic theme pivoting.

### Backend (Server)
- **Node.js & Express**: Framework handling all essential RESTful API operations and managing the origin HTTP server.
- **Socket.io**: Effectively upgrades the baseline HTTP server to support continuous WebSockets for handling vast amounts of real-time events.
- **MongoDB & Mongoose**: Powerful NoSQL database and Object Data Modeling (ODM) library acting as the permanent source of truth for accounts, media, and historical chat structures.

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
