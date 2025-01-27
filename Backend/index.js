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

    // try {
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
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'An error occurred while creating the user.' });
    // }
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

// GET endpoint for retreiving an event
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const entry = await prisma.entry.findUnique({
            where: { id: parseInt(id) },
        });

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
});

// GET endpoint for retrieving RSVPs for a given event
app.get('/rsvps/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
      const rsvps = await prisma.rsvp.findMany({
          where: { eventId: parseInt(eventId) },
      });

      const statusSummary = rsvps.reduce((acc, rsvp) => {
          acc[rsvp.status] = (acc[rsvp.status] || 0) + 1;
          return acc;
      }, {});

      res.json({ rsvps, statusSummary });
  } catch (error) {
      console.error('Error fetching RSVPs:', error);
      res.status(500).json({ error: 'Failed to fetch RSVPs' });
  }
});