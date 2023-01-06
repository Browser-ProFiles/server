const express = require('express');
const { authJwt, verifySignUp } = require('../middlewares');

const signUp = require('./auth/signUp');
const signIn = require('./auth/signIn');
const signOut = require('./auth/signOut');

const listInstance = require('./instance/list');
const viewInstance = require('./instance/view');
const newInstance = require('./instance/new');
const launchInstance = require('./instance/launch');
const editInstance = require('./instance/edit');
const removeInstance = require('./instance/remove');

const router = express.Router();

router.post('/auth/sign-up', [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
], signUp);
router.post('/auth/sign-in', signIn);
router.post('/auth/sign-out', [authJwt.verifyToken], signOut);

router.get('/instance/list', [authJwt.verifyToken], listInstance);
router.get('/instance/view/:name', [authJwt.verifyToken], viewInstance);

router.post('/instance/create', [authJwt.verifyToken, authJwt.hasEnoughSubscription], newInstance);
router.post('/instance/launch', [authJwt.verifyToken], launchInstance);
router.patch('/instance/edit', [authJwt.verifyToken], editInstance);
router.delete('/instance/remove', [authJwt.verifyToken], removeInstance);

module.exports = router;
