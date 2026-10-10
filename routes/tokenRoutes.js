const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { bookToken, getQueue, claimToken , markTreated} = require('../controllers/tokenController');

router.post('/', protect, authorize('patient'), bookToken);
router.get('/queue/:doctorId', protect, getQueue);
router.patch('/:id/claim', protect, authorize('doctor'), claimToken);
router.patch("/:id/treated", protect, authorize('doctor'), markTreated);

module.exports = router;