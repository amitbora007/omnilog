const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan'); //console logging 
const exphbs = require('express-handlebars'); //templating
const path = require('path');
const passport = require('passport'); //oauth authentication
const session = require('express-session'); //express sessions
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const methodOverride = require('method-override')

//load config
dotenv.config({ path: './config/config.env' })

//Passport config 
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// override with POST 
app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))


if (process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'));
}

// handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

// handlebars -template-engine
app.engine('.hbs',
    exphbs({
        helpers: { formatDate, stripTags, truncate, editIcon, select },
        defaultLayout: 'main',
        extname: '.hbs',
    })
);
app.set('view engine', '.hbs');

// Sessions
app.use(session({
    secret: 'first node application',
    resave: false,
    saveUninitialized: false,
    /* store: new MongoStore({
        mongoUrl: mongoose.connection._connectionString
    }, or 
    */
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

//global variable (logged in user)
app.use((req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Running on port ${PORT}`));