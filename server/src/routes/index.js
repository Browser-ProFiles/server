const express = require('express');
const { authJwt, verifySignUp, subscription } = require('../middlewares');

const signUp = require('./auth/signUp');
const signIn = require('./auth/signIn');

const listInstance = require('./instance/list');
const viewInstance = require('./instance/view');
const newInstance = require('./instance/new');
const editInstance = require('./instance/edit');
const removeInstance = require('./instance/remove');

const router = express.Router();

router.post('/auth/sign-up', [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
], signUp);
router.post('/auth/sign-in', signIn);

router.get('/instance/list', [authJwt.verify], listInstance);
router.get('/instance/view/:name', [authJwt.verify], viewInstance);

router.post('/instance/create', [authJwt.verify, subscription.hasEnoughSubscription], newInstance);
router.patch('/instance/edit/:name', [authJwt.verify], editInstance);
router.delete('/instance/remove/:name', [authJwt.verify], removeInstance);

module.exports = router;
