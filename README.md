# 🌦️ WeatherRoute

**WeatherRoute** is an AI-powered intelligent travel assistant that combines real-time weather forecasting, route planning, weather risk analysis, and conversational AI to help users make safer and smarter travel decisions.

---

## 🚀 Features

### 🌤️ Weather Intelligence

* Real-time weather information for any location
* 5-day weather forecast
* Air quality monitoring
* Weather trend visualization
* Weather risk analysis and alerts

### 🗺️ Route Planning

* Road route planning with interactive maps
* Weather checkpoints along the route
* Alternative route suggestions
* Route comparison and travel insights
* Route history and saved routes

### 🚆 Transport Comparison

* Road transport information
* Train route comparison
* Flight route comparison
* Travel mode analysis

### 🤖 WISE AI Assistant

* Voice-enabled chatbot powered by Google Gemini
* Natural language route planning
* Weather queries and recommendations
* Website navigation assistance
* Personalized travel suggestions

### 📊 Dashboard & Analytics

* User dashboard
* Search history
* Route history
* Favorites management
* Travel statistics

### 🔔 Smart Notifications

* Weather alerts
* Travel recommendations
* Route warnings

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Protected routes
* Personalized user experience

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Context API
* JavaScript
* HTML5
* CSS3

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## APIs and Services

* OpenWeather API
* Mapbox API
* Google Gemini API
* MongoDB Atlas
* RapidAPI (IRCTC)

---

# 📂 Project Structure

```
WeatherRoute
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   └── utils
│   └── package.json
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/anubrr21/weatherRoute.git

cd weatherRoute
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

OPENWEATHER_API_KEY=your_openweather_api_key

OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5

MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

IRCTC_API_KEY=your_irctc_api_key

IRCTC_API_HOST=irctc1.p.rapidapi.com

GEMINI_API_KEY=your_gemini_api_key

BACKEND_URL=http://localhost:5000

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=10000000
```

Start backend server:

```bash
npm start
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Start frontend:

```bash
npm run dev
```

---

# 🧠 AI Capabilities

WISE (Weather Intelligence & Smart Assistant) provides:

* Conversational weather queries
* Route planning assistance
* Voice interaction
* Website navigation help
* Personalized travel recommendations
* Weather risk awareness
* Intelligent travel suggestions

Powered by **Google Gemini AI**.

---

# 🔒 Security

* Environment variables used for sensitive credentials
* JWT authentication
* Protected routes
* API keys excluded using `.gitignore`
* Secure backend architecture

---


# 🎯 Future Enhancements

* Live traffic integration
* Offline route support
* Carbon footprint calculator
* Smart packing recommendations
* Multi-city trip planner
* Predictive weather intelligence
* Nearby places and fuel stations
* Real-time train information
* Advanced AI personalization

---

# 📚 Learning Outcomes

Through this project, I gained hands-on experience in:

* Full-stack web development
* REST API integration
* Authentication and authorization
* State management using Context API
* MongoDB database design
* AI integration with Google Gemini
* Route and weather analytics
* Responsive UI design
* Software engineering principles
* Git and GitHub version control

---

# 👨‍💻 Author

**Anubrata Bhattacharyya**



---

## ⭐ If you found this project interesting, consider giving it a star!
