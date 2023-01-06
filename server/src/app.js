const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieSession = require("cookie-session");

require('dotenv').config();

const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// cookie session
app.use(
    cookieSession({
        name: "session",
        secret: process.env.COOKIE_SECRET, // should use as secret environment variable
        // httpOnly: true,
        // sameSite: 'strict'
    })
);

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

app.use('/api/v1', api);

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
        maxProfiles: 2,
        price: 0,
    });

    Subscription.create({
        id: 2,
        maxProfiles: 5,
        price: 10,
    });

    Subscription.create({
        id: 3,
        maxProfiles: 20,
        price: 30,
    });

    Subscription.create({
        id: 4,
        maxProfiles: 100,
        price: 100,
    });
}

// initSubscriptions()
// initRoles()

module.exports = app;
