const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const platillosRoutes = require('./routes/platillo.routes.js');
const contactoRoutes = require('./routes/contacto.routes.js');
const authRoutes = require('./routes/auth.routes.js'); 
const dashboardRoutes = require('./routes/dashboard.routes.js');

const app = express();

app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1'], 
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

app.use(session({
    secret: process.env.SESSION_SECRET || 'un-secreto-muy-secreto', 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.get('/', (req, res) => {
  res.json({ message: 'API de GreenPlate v1' });
});

platillosRoutes(app);
contactoRoutes(app);
authRoutes(app);
dashboardRoutes(app);

module.exports = app; 