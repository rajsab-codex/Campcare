# CampCare - Campus Management System

A comprehensive campus management platform designed to make campus life safer, more organized, and student-friendly. CampCare provides unified solutions for campus complaints, lost & found management, and women safety services.

## Features

### 1. Campus Complaint System
- Category-based complaint filing (Infrastructure, Academics, Hostel, Canteen, Transportation)
- Image attachments support
- Real-time status tracking (Pending, In Progress, Resolved)
- Admin resolution workflow

### 2. Lost & Found Module
- Post lost items with detailed descriptions
- Post found items with images
- **Interactive map location picker** - select exact location on map
- Contact owner/finder functionality
- Search and filter capabilities
- Mark items as recovered/claimed

### 3. Women Safety SOS
- One-tap SOS emergency button
- Location sharing with coordinates
- Emergency contacts management
- Safety guidelines and resources
- Quick access to campus security

### 4. Campus Map
- Interactive map with Leaflet/OpenStreetMap
- Pre-marked location for MES College Zuarinagar, Verna, Goa
- Works with or without Google Maps API key

### 5. Notifications System
- Real-time notifications for updates
- **Clear all** button to remove all notifications
- **View** button to navigate directly to the relevant page
- **X** button to remove individual notifications
- Auto-refresh every 2 seconds

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI / shadcn/ui
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Maps**: Leaflet / OpenStreetMap (with Google Maps support)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Prerequisites

Before running this project, make sure you have:

- Node.js 18.17 or later
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   
```
bash
   git clone <repository-url>
   cd campus-project-website
   
```

2. **Install dependencies**
   
```
bash
   npm install
   # or
   yarn install
   
```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   
```
env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/campuscare

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # (Optional) Google Maps API Key for advanced features
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # (Optional) OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
```

4. **Run the development server**
   
```
bash
   npm run dev
   
```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
campus-project-website/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js routes
│   │   ├── complaints/           # Complaint API endpoints
│   │   ├── lost-found/           # Lost & Found API endpoints
│   │   ├── sos/                  # SOS API endpoints
│   │   └── comments/             # Comments API endpoints
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── complaints/           # Complaint management
│   │   ├── lost-found/           # Lost & Found items
│   │   ├── sos/                  # Safety SOS
│   │   ├── admin-sos/            # Admin SOS management
│   │   └── map/                  # Campus map
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   └── login/                    # Login page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard-header.tsx      # Dashboard navigation
│   ├── dashboard-sidebar.tsx      # Dashboard sidebar
│   ├── map-picker.tsx            # Interactive location picker
│   ├── map-component.tsx         # Campus map component
│   ├── notifications-popup.tsx  # Notifications system
│   └── chatbot-widget.tsx        # AI chatbot
├── lib/                          # Utility functions & models
│   ├── auth.ts                   # Authentication config
│   ├── db.ts                     # MongoDB connection
│   ├── permissions.ts             # User permissions
│   ├── complaint-model.ts         # Complaint Mongoose model
│   ├── lostfound-model.ts        # Lost & Found Mongoose model
│   ├── notifications.ts          # Notifications utilities
│   └── sos-types.ts              # SOS type definitions
├── public/                       # Static assets
├── styles/                       # Global styles
└── hooks/                        # Custom React hooks
```

## API Endpoints

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | Get all complaints |
| POST | `/api/complaints` | Create new complaint |
| GET | `/api/complaints/[id]` | Get complaint by ID |
| PUT | `/api/complaints/[id]` | Update complaint |
| DELETE | `/api/complaints/[id]` | Delete complaint |

### Lost & Found
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lost-found` | Get all lost/found items |
| POST | `/api/lost-found` | Post new item |
| GET | `/api/lost-found/[id]` | Get item by ID |
| PUT | `/api/lost-found/[id]` | Update item |
| DELETE | `/api/lost-found/[id]` | Delete item |

### SOS Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sos` | Get all SOS alerts |
| POST | `/api/sos` | Trigger SOS alert |
| GET | `/api/sos/test-db` | Test database connection |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments` | Get all comments |
| POST | `/api/comments` | Create comment |
| GET | `/api/comments/[id]` | Get comment by ID |
| PUT | `/api/comments/[id]` | Update comment |
| DELETE | `/api/comments/[id]` | Delete comment |

## User Roles & Permissions

| Role | Complaints | Lost & Found | View Data | Update Status |
|------|------------|--------------|-----------|---------------|
| Student | ✅ Submit | ✅ Add/Edit Own | ✅ View | ❌ |
| Faculty | ❌ Submit | ✅ Add | ✅ View All | ✅ Update |
| Superadmin | ✅ All | ✅ All | ✅ View All | ✅ All |

### Permission Details

**Students:**
- Can submit complaints
- Can post lost/found items
- Can edit their own lost/found items
- Can view all complaints and lost/found items

**Faculty:**
- Can view all complaints and lost/found items
- Can update complaint status
- Can post lost/found items

**Superadmin:**
- Full access to all features
- Can manage all data

## Getting Started After Login

1. **Dashboard** - Overview with statistics and quick actions
2. **Complaints** - View and manage campus complaints
3. **Lost & Found** - Browse and post lost/found items
4. **SOS** - Emergency safety features
5. **Map** - Interactive campus map

## New Features Guide

### Location Picker
When posting a lost or found item, you can now:
- Click the map pin icon to open the interactive map
- Search for a location by name
- Click on the map to drop a pin
- Drag the pin to adjust the exact location
- The system will automatically get the readable address name

### Notifications
The notification system now includes:
- **Clear All**: Remove all notifications at once
- **View Button**: Navigate directly to the relevant item (complaint or lost/found)
- **X Button**: Remove individual notifications
- Auto-refresh every 2 seconds

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for advanced map features | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

## License

This project is for educational purposes and is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for Campus Communities

