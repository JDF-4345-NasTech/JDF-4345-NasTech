const express = require('express');
const {
  saveDescriptionHandler,
  getDescriptionHandler,
} = require('../controllers/descriptionController');

const router = express.Router();

// Route to save a new description
router.post('/', saveDescriptionHandler);

// Route to get a description by ID
router.get('/:id', getDescriptionHandler);

module.exports = router;
