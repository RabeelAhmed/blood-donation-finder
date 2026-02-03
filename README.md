# Blood Donation Finder 🩸

A full-stack MERN application designed to connect blood donors with patients in need. This platform streamlines the process of finding heroes in your community, tracking donation history, and managing lifesaving requests in real-time.

## 🚀 Features

### For Patients
- **Smart Search**: Find donors by blood group, city, and availability.
- **Favorites System**: Bookmark trusted donors for quick access in emergencies.
- **Real-time Requests**: Send blood requests directly to donors and track their status.
- **Quick Contact**: Integrated **Call** 📞 and **WhatsApp** 💬 buttons for instant communication.

### For Donors
- **Donation History**: Log and track every donation with dates, locations, and notes.
- **Eligibility Tracker**: Automatic calculation of the next eligible donation date based on safety guidelines.
- **Dashboard Stats**: View total donations made and current eligibility status at a glance.
- **Availability Toggle**: Easily switch your donor status "on" or "off".
- **Request Management**: Receive, accept, or reject incoming blood requests.

### General
- **Dual Support**: Fully responsive, mobile-first design.
- **Theme Support**: Beautiful light and dark modes.
- **Security**: JWT-based authentication and BCrypt password encryption.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB (Atlas or Local).
- **Authentication**: JSON Web Tokens (JWT).

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a cluster URI)

### 1. Clone the Repository
```bash
git clone https://github.com/RabeelAhmed/blood-donation-finder.git
cd blood-donation-finder
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

#### Development
The client is configured to automatically connect to the local backend at `http://localhost:5000` when running locally.
```bash
npm run dev
```

#### Production
For production builds, the client uses the Vercel URL configured in `.env`.
```bash
npm run build
```

## 📱 Screenshots (Conceptual)
| Donor Dashboard | Patient Search | Mobile Navigation |
| :---: | :---: | :---: |
| Stats & History | Filter by Group/City | Hamburger Menu |

## 🤝 Contributing
Contributions are welcome! If you'd like to improve the app, please feel free to fork the repo and submit a pull request.

## 📄 License
This project is licensed under the ISC License.

---
*Made with ❤️ to save lives.*
