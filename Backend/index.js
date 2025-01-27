const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// POST endpoint for creating an organization
app.post('/organizations', async (req, res) => {
    const { name, userId } = req.body;

    if (!name || !userId) {
        return res.status(400).json({ error: 'Missing required fields: name or userId.' });
    }

    try {
    const newOrganization = await prisma.organization.create({
      data: {
        name,
      },
    });

    await prisma.user.update({
      where: { id: userId }, 
      data: {
        isOrgAdmin: true,
        organizationId: newOrganization.id,
      },
    });

      res.status(201).json(newOrganization);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create organization' });
    }
});
  
// POST endpoint for creating an event
app.post('/events', async (req, res) => {
    const { name, date, location, description, organizationId } = req.body;
    try {
        const newEvent = await prisma.event.create({
            data: {
                name,
                date,
                location,
                description,
                organizationId,
            },
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create event' });
    }
});

// POST endpoint for creating a user
app.post('/user', async (req, res) => {
    const { id } = req.body;

    try {
        // Check if the email (id) already exists in the database
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        const newUser = await prisma.user.create({
            data: {
                id
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
});

// POST endpoint to create an RSVP
app.post('/rsvp', async (req, res) => {
  const { email, response, eventId } = req.body;

  try {
      const newRSVP = await prisma.rSVPResponse.create({
          data: {
              email,
              response,
              eventId,
          },
      });
      res.status(201).json(newRSVP);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create RSVP' });
  }
});

// PATCH for changing user admin status
app.patch('/userAdmin', async (req, res) => {
    const { userId, isOrgAdmin, organizationId } = req.body;
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isOrgAdmin,
          organizationId,
        },
      });
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user.' });
    }
});
  

// GET endpoint for retrieving all events for a specific organization
app.get('/organizations/:organizationId/events', async (req, res) => {
    const { organizationId } = req.params;
    try {
        const events = await prisma.event.findMany({
            where: {
                organizationId: parseInt(organizationId),
            },
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch events' });
    }
});

// GET endpoint for retrieving an organization
app.get('/organizations/:organizationId', async (req, res) => {
  const { organizationId } = req.params; // Extract organizationId from params

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.status(200).json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'An error occurred while fetching the organization.' });
  }
});

// GET endpoint to retrieve a user admin status and their organization
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing user ID.' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({
      isOrgAdmin: user.isOrgAdmin,
      organizationId: user.organizationId,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

app.listen(port, () => {
    console.log('starting');
})

app.post('/description', async (req, res) => {
  const { description } = req.body;

  if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
  }

  try {
      const newDescription = await prisma.description.create({
          data: {
              description,
          },
      });
      res.status(201).json(newDescription);
  } catch (error) {
      console.error('Error saving description:', error);
      res.status(500).json({ error: 'Failed to save description.' });
  }
});

app.get('/description/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const description = await prisma.description.findUnique({
          where: { id: parseInt(id) },
      });

      if (!description) {
          return res.status(404).json({ error: 'Description not found.' });
      }

      res.status(200).json(description);
  } catch (error) {
      console.error('Error fetching description:', error);
      res.status(500).json({ error: 'Failed to fetch description.' });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});