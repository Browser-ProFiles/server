const express = require('express');
const { authJwt, verifySignUp, subscription } = require('../middlewares');

const signUp = require('./auth/signUp');
const signIn = require('./auth/signIn');
const confirmSignUp = require('./auth/confirmSignUp');
const currentUser = require('./auth/getUser');

const listInstance = require('./instance/list');
const viewInstance = require('./instance/view');
const newInstance = require('./instance/new');
const editInstance = require('./instance/edit');
const removeInstance = require('./instance/remove');

const freekassaPaymentRequest = require('./payment/freekassa/request');
const freekassaPaymentHook = require('./payment/freekassa/hook');
const freekassaHookFail = require('./payment/freekassa/hookFail');
const freekassaHookSuccess = require('./payment/freekassa/hookSuccess');

const generateFingerprint = require('./utils/generateFingerprint');
const browserRevisions = require('./utils/browserRevisions');
const subscriptionsList = require('./utils/subscriptions');

const router = express.Router();

router.post('/auth/sign-up', [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
], signUp);
router.post('/auth/sign-in', signIn);
router.post('/auth/confirm/sign-up', confirmSignUp);
router.get('/user/current', [authJwt.verify], currentUser);

router.get('/instance/list', [authJwt.verify], listInstance);
router.get('/instance/view/:name', [authJwt.verify], viewInstance);

router.post('/instance/create', [authJwt.verify, subscription.hasEnoughSubscription], newInstance);
router.patch('/instance/edit/:name', [authJwt.verify], editInstance);
router.delete('/instance/remove/:name', [authJwt.verify], removeInstance);

router.post('/payment/request/freekassa', [authJwt.verify], freekassaPaymentRequest);
router.post('/payment/hook/freekassa', [], freekassaPaymentHook);
router.post('/payment/success/freekassa', [], freekassaHookSuccess);
router.post('/payment/error/freekassa', [], freekassaHookFail);

router.post('/generate/fingerprint', [authJwt.verify], generateFingerprint);
router.get('/browser/versions', [authJwt.verify], browserRevisions);
router.get('/subscriptions/list', [], subscriptionsList);

module.exports = router;
