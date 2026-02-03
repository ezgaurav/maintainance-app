# Home Appliance Maintenance App

A comprehensive full-stack Home Appliance Maintenance/Repair Service application with three user interfaces: Customer App, Technician App, and Admin Dashboard.

## 🚀 Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- Leaflet (OpenStreetMap)

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.io
- Supabase (PostgreSQL)
- JWT Authentication

## 📋 Features

### Customer App
- User registration with phone OTP verification
- Create maintenance/repair issues with images
- Real-time technician assignment updates
- Job completion notifications
- Rating and review system
- 3-day re-evaluation reminders

### Technician App
- Registration with government ID verification
- Receive job assignments
- Accept/Reject jobs within 1-hour deadline
- Schedule jobs based on priority
- Complete jobs with evidence (photos, videos, audio, text)
- E-commerce for spare parts
- Payment tracking (7-15 day hold period)

### Admin Dashboard
- User and technician management
- Smart technician matching algorithm (skill + distance based)
- Manual job assignment
- Real-time notifications for new issues
- 2-hour alerts for unassigned issues
- Inventory management with low-stock alerts
- Complaint and refund handling
- Force complete functionality
- Analytics and reporting

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `users` - All users (customers, technicians, admins)
- `technicians` - Extended technician profiles
- `issues` - Maintenance/repair jobs
- `spare_parts` - Inventory management
- `orders` - E-commerce orders
- `complaints` - Customer complaints and refunds
- `notifications` - Real-time notifications

See `database/schema.sql` for complete schema.

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd maintainance-app
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Setup environment variables:
```bash
# Copy example env files
cp .env.example .env

# Edit .env with your Supabase credentials
```

4. Setup Supabase database:
- Create a new Supabase project
- Run the SQL schema from `database/schema.sql`
- Copy your Supabase URL and keys to `.env`

5. Start development servers:
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend (from client directory, in another terminal)
npm run dev
```

## 🚦 Usage

### Development
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Socket.io: `http://localhost:5000`

### Default Admin Credentials
- Email: `admin@maintainance.app`
- Password: `admin123`

**⚠️ Change the default admin password in production!**

## 📱 User Flows

### Customer Journey
1. Register → Phone OTP verification
2. Create issue (appliance type, description, images, address, priority)
3. System finds nearby technician by skill
4. Admin assigns technician
5. Technician accepts → Customer sees tech details
6. Task completed → Payment
7. Rate technician (1-5 stars)
8. 3-day re-evaluation notification

### Technician Journey
1. Register with government ID
2. Admin verification
3. Receive job assignments
4. Accept/Reject within 1 hour
5. Schedule job based on priority
6. Complete with evidence (photos, videos, text mandatory)
7. Payment released after 7-15 days

### Admin Workflow
1. Login to admin dashboard
2. Receive notification for new issues
3. View algorithm-suggested technicians (by skill + distance)
4. Assign technician
5. Monitor job progress
6. Handle complaints and refunds
7. Manage inventory with stock alerts
8. Force complete if needed

## 🗺️ Maps Integration

Using free OpenStreetMap with Leaflet.js:
- Address autocomplete (Nominatim API)
- GPS location capture
- Distance-based technician search (Haversine formula)
- Interactive map display

## ⏰ Automated Tasks

- **1-hour acceptance timer**: Alert if technician doesn't accept
- **2-hour unassigned alert**: Notify admin if no technician found
- **3-day re-evaluation**: Customer follow-up notification
- **7-15 day payment release**: Automatic payment release

## 🔔 Real-time Features

Socket.io events:
- New issue created
- Technician assigned
- Job accepted/completed
- Low stock alerts
- General notifications

## 📦 Project Structure

```
maintainance-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── socket/         # Socket.io handlers
│   └── package.json
├── database/
│   └── schema.sql          # Database schema
└── README.md
```

## 🔒 Security

- JWT-based authentication
- Phone OTP verification
- Password hashing with bcrypt
- Government ID verification for technicians
- File upload validation
- Input sanitization
- CORS configuration

## 📝 API Documentation

See `/server/README.md` for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@maintainance.app or open an issue.
