const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

// RSVP Route for confirmation email
app.post('/rsvpMail', async (req, res) => {
  const { email, response, eventId, eventName, eventDate } = req.body;

  try {
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `RSVP Confirmation for ${eventName}`,
          text: `Hello,\n\nYou have successfully RSVP'd with response: ${response}\n\nEvent: ${eventName}\nDate: ${new Date(eventDate).toLocaleString()}\n\nThank you for your response!\n\n- Funrazor Team`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'RSVP submitted and email sent!' });
  } catch (error) {
      console.error('Error sending RSVP email:', error);
      res.status(500).json({ message: 'RSVP submission failed.' });
  }
});

// DELETE to clear databases
app.delete('/all', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.rSVPResponse.deleteMany(),
      prisma.event.deleteMany(),
      prisma.user.deleteMany(),
      prisma.organization.deleteMany(),
    ]);

    res.json({ message: 'All data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST endpoint for creating an organization
app.post('/organizations', async (req, res) => {
  const { name, description, userId } = req.body;

  // Check if the necessary fields are present
  if (!name || !description || !userId) {
    return res.status(400).json({ error: 'Missing required fields: name, description, or userId.' });
  }

  try {
    const newOrganization = await prisma.organization.create({
      data: {
        name,
        description,
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
          include: {
              rsvpResponses: true,
          },
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch events' });
    }
});

// GET endpoint for retrieving all organizations
app.get('/organizations', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany();
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'An error occurred while fetching organizations.' });
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

// GET endpoint for retreiving an event
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const entry = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { rsvpResponses: true },
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
      const rsvps = await prisma.RSVPResponse.findMany({
          where: { eventId: parseInt(eventId) },
      });

      if (!rsvps) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const statusSummary = rsvps.reduce((acc, rsvp) => {
          acc[rsvp.response] = (acc[rsvp.response] || 0) + 1;
          return acc;
      }, {});

      res.json({ rsvps, statusSummary });
  } catch (error) {
      console.error('Error fetching RSVPs:', error);
      res.status(500).json({ error: 'Failed to fetch RSVPs' });
  }
});