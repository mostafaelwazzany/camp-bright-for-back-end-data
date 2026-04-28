const router = require('express').Router();
const { healthcheck } = require('../controllers/health.contoller');

router.get('/health', healthcheck);

module.exports = router;