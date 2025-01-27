const { saveDescription, getDescriptionById } = require('../models/descriptionModel');

// Controller to handle saving a description
const saveDescriptionHandler = async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const savedDescription = await saveDescription(description);
    res.status(201).json(savedDescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller to handle retrieving a description by ID
const getDescriptionHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const description = await getDescriptionById(id);
    if (!description) {
      return res.status(404).json({ error: 'Description not found' });
    }
    res.json(description);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { saveDescriptionHandler, getDescriptionHandler };
