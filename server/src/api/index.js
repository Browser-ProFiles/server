const express = require('express');

const newInstance = require('./instance/new');

const router = express.Router();

router.use('/instance/create', newInstance);

module.exports = router;
