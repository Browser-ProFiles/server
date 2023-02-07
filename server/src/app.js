const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieSession = require('cookie-session');
const { lang } = require('./middlewares');

require('dotenv').config({
    path: path.join(__dirname, '../.env')
});

const routes = require('./routes');

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL, process.env.LANDING_URL]
}));
app.options('*', cors());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', `${process.env.FRONTEND_URL},${process.env.LANDING_URL}`);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Api-Key'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// cookie session
app.use(
    cookieSession({
        name: "session",
        secret: process.env.COOKIE_SECRET, // should use as secret environment variable
        // httpOnly: true,
        // sameSite: 'strict'
    })
);

// i18n
app.use(lang);

// database
const db = require('./models');
const Role = db.role;
const Subscription = db.subscription;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

app.use('/api/v1', routes);

function initRoles() {
    Role.create({
        id: 1,
        name: "user",
    });

    Role.create({
        id: 2,
        name: "admin",
    });
}

function initSubscriptions() {
    Subscription.create({
        id: 1,
        name: 'Free',
        maxProfiles: 2,
        price: 0,
    });

    Subscription.create({
        id: 2,
        name: 'Basic',
        maxProfiles: 10,
        price: 10,
    });

    Subscription.create({
        id: 3,
        name: 'Pro',
        maxProfiles: 50,
        price: 30,
    });

    Subscription.create({
        id: 4,
        name: 'Max',
        maxProfiles: 200,
        price: 100,
    });
}

// initSubscriptions()
// initRoles()

module.exports = app;
