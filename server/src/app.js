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

app.use(function (req, res, next) {
    const origins = [
        process.env.FRONTEND_URL,
        process.env.LANDING_URL,
    ];

    console.log('req.headers.origin', req.headers.origin)
    console.log('origins', origins)
    for (let i = 0; i < origins.length; i++){
        let origin = origins[i];

        if (req.headers.origin.indexOf(origin) > -1) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(morgan('dev'));
// app.use(helmet());

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
