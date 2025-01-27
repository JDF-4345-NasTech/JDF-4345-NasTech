const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save description to the database
const saveDescription = async (description) => {
  return prisma.description.create({
    data: { description },
  });
};

// Retrieve description by ID
const getDescriptionById = async (id) => {
  return prisma.description.findUnique({
    where: { id: parseInt(id) },
  });
};

module.exports = { saveDescription, getDescriptionById };
