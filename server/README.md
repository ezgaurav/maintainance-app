# Home Appliance Maintenance API Server

Backend API server for the Home Appliance Maintenance Application built with Node.js, Express, TypeScript, and Supabase.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Customer, Technician, Admin)
- **Issue Management**: Complete issue tracking and job management system
- **Real-time Updates**: Socket.IO integration for live notifications
- **Scheduled Tasks**: Automated cron jobs for timeouts, payments, and alerts
- **Spare Parts E-commerce**: Full CRUD operations for parts ordering
- **Complaint System**: Comprehensive complaint handling and resolution
- **Rating System**: Customer feedback and technician rating management

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Zod
- **Scheduling**: node-cron

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files (Supabase, Socket.IO)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, error handling middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (scheduler, distance calc)
│   └── index.ts          # Main server file
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

4. Set up the database:
```bash
# Run the schema.sql file in your Supabase SQL editor
# Located at: database/schema.sql
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Production

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user profile

### Issues (Customer)
- `POST /api/issues` - Create new issue
- `GET /api/issues/my` - Get customer's issues
- `GET /api/issues/:id` - Get issue details
- `POST /api/issues/:id/rate` - Rate completed issue
- `POST /api/issues/:id/cancel` - Cancel issue

### Technician
- `GET /api/technician/jobs` - Get assigned jobs
- `POST /api/technician/jobs/:id/accept` - Accept job
- `POST /api/technician/jobs/:id/reject` - Reject job
- `POST /api/technician/jobs/:id/schedule` - Schedule job
- `POST /api/technician/jobs/:id/complete` - Complete job
- `GET /api/technician/profile` - Get technician profile
- `PUT /api/technician/profile` - Update profile
- `GET /api/technician/stats` - Get statistics

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/issues` - Get all issues
- `GET /api/admin/users` - Get all users
- `GET /api/admin/technicians` - Get all technicians
- `POST /api/admin/technicians/:id/verify` - Verify technician
- `POST /api/admin/technicians/:id/block` - Block technician
- `POST /api/admin/issues/:id/assign` - Assign technician
- `POST /api/admin/issues/:id/force-complete` - Force complete
- `GET /api/admin/find-technicians/:issueId` - Find matching technicians
- `GET /api/admin/complaints` - Get all complaints
- `POST /api/admin/complaints/:id/resolve` - Resolve complaint

### Spare Parts
- `GET /api/parts` - Get all parts
- `GET /api/parts/:id` - Get part by ID
- `POST /api/parts` - Create part (admin)
- `PUT /api/parts/:id` - Update part (admin)
- `DELETE /api/parts/:id` - Delete part (admin)
- `GET /api/parts/search` - Search parts

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

## Scheduled Tasks

The system runs several automated cron jobs:

- **Acceptance Timeouts** (Every 5 minutes): Reset issues if technician doesn't accept within 1 hour
- **Unassigned Issues** (Hourly): Alert admins about issues pending for 2+ hours
- **Payment Releases** (Daily at midnight): Release payments after hold period
- **Re-evaluation Reminders** (Daily at 9 AM): Remind customers to rate after 3 days
- **Low Stock Alerts** (Hourly): Notify admins about low stock parts

## Socket.IO Events

### Client → Server
- `join-room` - Join user-specific room
- `technician-location` - Update technician location

### Server → Client
- `new-notification` - New notification received
- `new-issue` - New issue created (admin)
- `issue-assigned` - Issue assigned to technician
- `issue-accepted` - Technician accepted issue
- `issue-completed` - Issue marked as completed
- `new-rating` - New rating received
- `payment-released` - Payment released to technician

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses follow this format:
```json
{
  "error": "Error message",
  "details": "Additional details (in development mode)"
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from login/register endpoints and contains:
- `userId` - User's unique ID
- `role` - User's role (customer/technician/admin)

## Role-Based Access

- **Customer**: Can create issues, rate jobs, order parts
- **Technician**: Can accept/reject/complete jobs, manage profile
- **Admin**: Full access to all resources and management

## Development Tips

- Use `npm run dev` for hot reload during development
- Check logs in console for detailed request/error information
- Use the `/api/health` endpoint to verify server status
- Test Socket.IO connections using a WebSocket client

## License

ISC

## Support

For support, please contact the development team or open an issue in the repository.
