# Pulse Chat - Anonymous Location-Based Temporary Chat App

A real-time anonymous chat application where users can create and join temporary chat rooms based on their location.

## Features

- ✨ **Anonymous Authentication**: Auto-generated usernames, no email/password required
- 📍 **Location-Based**: Find and join chat rooms within 5km radius
- ⏰ **Temporary Rooms**: All rooms automatically expire after 2 hours
- 💬 **Real-Time Chat**: Instant messaging using WebSockets (Socket.IO)
- 🔒 **No History**: Messages are automatically deleted when rooms expire
- 📱 **Responsive UI**: Modern, clean interface with smooth animations
- 🎨 **Dark Mode**: Beautiful dark theme optimized for chat

## Tech Stack

### Client (Web App)

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: Zustand (with persist middleware)
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Icons**: Material Symbols

### Server (Backend API)

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **WebSocket**: Socket.IO
- **Auto-Cleanup**: TTL indexes for automatic data expiration

## Project Structure

```bash
pulse-chat/
├── client/                 # React Web App
│   ├── pages/             # Page components
│   │   ├── ChatPage.tsx   # Real-time chat interface
│   │   ├── RoomsPage.tsx  # Browse nearby rooms
│   │   ├── CreateRoomPage.tsx  # Create new room
│   │   ├── LocationPage.tsx    # Request location access
│   │   └── ProfilePage.tsx     # Edit username
│   ├── components/        # Reusable components
│   ├── services/          # API & Socket services
│   ├── store/            # Zustand state management
│   └── types.ts          # TypeScript definitions
│
└── server/                # Node.js Express server
    ├── src/
    │   ├── models/       # MongoDB models
    │   ├── controllers/  # Route controllers
    │   ├── routes/       # API routes
    │   ├── socket/       # Socket.IO logic
    │   └── config/       # Database config
    └── package.json

```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or cloud)
- Expo CLI
- Android Studio / Xcode (for mobile emulators)

### Server Setup

1. Navigate to server directory:

```bash
cd server
```

1. Install dependencies:

```bash
npm install
```

1. Create `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pulse-chat
NODE_ENV=development
```

1. Start the development server:

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Client Setup

1. Navigate to client directory:

```bash
cd client
```

1. Install dependencies:

```bash
npm install
```

1. Update API endpoints in `constants/config.ts`:

```typescript
export const API_URL = "http://YOUR_LOCAL_IP:3000/api";
export const SOCKET_URL = "http://YOUR_LOCAL_IP:3000";
```

**Important**: Replace `YOUR_LOCAL_IP` with your computer's local IP address (not `localhost`) to test on physical devices.

1. Start the Expo development server:

```bash
npm start
```

1. Run on device/emulator:

- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## API Endpoints

### User

- `POST /api/user/anonymous-create` - Create anonymous user
- `PATCH /api/user/update-username` - Update username

### Room

- `POST /api/room/create` - Create new room
- `GET /api/room/nearby` - Get nearby rooms (5km radius)
- `POST /api/room/join` - Join a room
- `GET /api/room/:roomId` - Get room details

### Message

- `GET /api/message/:roomId` - Get room messages

## Socket Events

### Client → Server

- `joinRoom` - Join a chat room
- `sendMessage` - Send a message
- `leaveRoom` - Leave a room

### Server → Client

- `newMessage` - Receive new message
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `roomExpired` - Room expired notification

## Database Models

### User

- `_id`: ObjectId
- `username`: String (auto-generated)
- `location`: GeoJSON Point
- `createdAt`: Date

### Room

- `_id`: ObjectId
- `title`: String
- `tags`: Array of Strings
- `creator`: User reference
- `location`: GeoJSON Point
- `members`: Array of User references
- `expiresAt`: Date (TTL index)
- `createdAt`: Date

### Message

- `_id`: ObjectId
- `room`: Room reference
- `sender`: User reference
- `content`: String
- `expiresAt`: Date (TTL index)
- `createdAt`: Date

## Key Features Implementation

### 1. Anonymous Login

- Auto-generated usernames (e.g., "BraveTiger42")
- No authentication required
- User data persisted in AsyncStorage

### 2. Location-Based Rooms

- Uses Haversine formula for distance calculation
- MongoDB 2dsphere index for geospatial queries
- 5km maximum radius

### 3. Temporary Rooms

- TTL indexes on MongoDB collections
- Rooms expire exactly 2 hours after creation
- Messages expire with room
- Socket.IO notifies users of expiration

### 4. Real-Time Chat

- WebSocket connections via Socket.IO
- Message rate limiting (10 messages per 10 seconds)
- Automatic reconnection
- Room-based message broadcasting

## UI/UX Features

- **Modern Design**: Clean, minimal interface with soft colors
- **Glassmorphism**: Frosted glass effects on cards
- **Smooth Animations**: Micro-interactions on button presses
- **Bottom Tab Navigation**: Easy access to main features
- **Live Updates**: Real-time room member count and expiry timer
- **Pull to Refresh**: Update nearby rooms list
- **Responsive Layout**: Optimized for various screen sizes

## Development Notes

### NativeWind Configuration

TailwindCSS classes are used throughout the app with NativeWind for React Native.

### State Management

Zustand stores:

- `userStore`: User authentication and location
- `roomStore`: Room management
- `messageStore`: Chat messages

### Error Handling

- Network errors caught and displayed to user
- Location permission requests
- Room expiry handling
- Rate limiting on messages

## Production Deployment

### Server

1. Set production MongoDB URI in .env
2. Configure environment variables
3. Build TypeScript: `npm run build`
4. Deploy to platform (Heroku, Railway, DigitalOcean, etc.)
5. Enable CORS for your client domain

### Client

1. Update `VITE_API_URL` in `.env` to production backend URL
2. Build for production: `npm run build`
3. Deploy to hosting platform (Vercel, Netlify, etc.)

## Key Implementation Details

### Room Expiration (2-Hour Auto-Delete)

The application implements automatic room and message cleanup after 2 hours:

1. **Backend**: Rooms are created with `expiresAt` timestamp set to 2 hours from creation
2. **MongoDB TTL Index**: The `expiresAt` field has a TTL index that automatically deletes expired rooms
3. **Message Cascade**: Messages also have `expiresAt` field matching the room's expiration
4. **Real-time Notification**: Socket.IO notifies all users when a room expires
5. **Frontend Timer**: Live countdown timer shows remaining time in the chat interface

### Data Flow

1. **User Creation**: Location permission → Create anonymous user in MongoDB
2. **Find Rooms**: Backend queries MongoDB with geospatial index for nearby rooms
3. **Join Room**: User joins room → Socket.IO connection established
4. **Real-time Chat**: Messages sent via Socket.IO → Saved to MongoDB → Broadcast to room
5. **Auto-Cleanup**: MongoDB automatically removes expired rooms and messages

## Security Considerations

- No sensitive data stored
- Rate limiting on messages (10 messages per 10 seconds)
- Location data only used for proximity calculations
- No permanent user identification
- Auto-cleanup of expired data via MongoDB TTL indexes
- CORS configured for allowed origins

## Future Enhancements

- [ ] Push notifications for messages
- [ ] Image/media sharing
- [ ] Room categories/filters
- [ ] Block/report users
- [ ] Custom room durations
- [ ] Room capacity limits
- [ ] Message reactions (partially implemented)
- [ ] Typing indicators (implemented)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
