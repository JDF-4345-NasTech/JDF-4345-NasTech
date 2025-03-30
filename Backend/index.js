const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const port = 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

//Event Creation Route for notification email
app.post('/eventNotification', async (req, res) => {
  const { email, eventName, eventDate, eventDescription, orgName} = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `New ${eventName} Event from ${orgName}!`,
    text: `We have a new event for you from ${orgName} who you subscribed to!\n\nEvent: ${eventName}\nDate: ${new Date(eventDate).toLocaleString()}\nAbout: ${eventDescription}\n\n Check ${orgName}'s page for more info! - Funrazor Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email notification sent!' });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ message: 'Email notification failed.' });
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
    const existingOrg = await prisma.organization.findFirst({
      where: { name },
    });

    if (existingOrg) {
      return res.status(409).json({ error: 'An organization with this name already exists.' });
    }

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

//PUT endpoint for updating an org's description
app.put('/orgdesc/:organizationId', async (req, res) => {
    const { organizationId } = req.params;
    const { description } = req.body;

    try {
        const updatedUser = await prisma.organization.update({
          where: { id: parseInt(organizationId) },
          data: {
            description,
          },
        });
    
        res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user.' });
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
  const { email, response, eventId, eventName, eventDate } = req.body;

  try {
    const newRSVP = await prisma.rSVPResponse.upsert({
      where: {
        email_eventId: { email, eventId }
      },
      update: {
        response, // Update existing RSVP with new response
      },
      create: {
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

// POST endpoint to subscribe a user to an organization
app.post('/organizations/:organizationId/subscribe', async (req, res) => {
  const { organizationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'No user ID.' });
  }

  try {
    const newSubscription = await prisma.subscriptions.create({
      data: {
        userId,
        organizationId: parseInt(organizationId),
      },
    });

    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error subscribing user:', error);
    res.status(500).json({ error: 'Failed to subscribe user.' });
  }
});

// GET endpoint to retrieve subscribers of an organization
app.get('/organizations/:organizationId/subscribers', async (req, res) => {
  const { organizationId } = req.params;

  try {
    const subscribers = await prisma.subscriptions.findMany({
      where: {
        organizationId: parseInt(organizationId),
      },
      include: {
        user: true,
      },
    });

    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

app.post('/organizations/:organizationId/unsubscribe', async (req, res) => {
  const { organizationId } = req.params;
  const { userId } = req.body;
  try {    
    const subscribers = await prisma.subscriptions.deleteMany({
      where: {
        userId: userId,
        organizationId: parseInt(organizationId),
      },
    });

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Failed to delete subscribers.' });
  }
});

// GET endpoint for dynamic search for events or organizations depending on parameter
app.get('/search', async (req, res) => {
  const { type, query, organizationId } = req.query;

  if (!type || !query) {
    return res.status(400).json({ error: 'Missing required parameters: type and query.' });
  }
  try {
    let results;
    if (type === 'organizations') {
      results = await prisma.organization.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
    } else if (type === 'events') {
      results = await prisma.event.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
          ...(organizationId && { organizationId: parseInt(organizationId) }),
        },
      });
    } else {
      return res.status(400).json({ error: 'Invalid type parameter. Use "organizations" or "events".' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

// GET endpoint for retreiving an event
app.get('/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
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

// GET for donation amount
app.get("/events/:eventId/donations", async (req, res) => {
  const eventId = parseInt(req.params.eventId);

  const totalDonations = await prisma.donation.aggregate({
    where: { eventId },
    _sum: { amount: true },
  });

  res.json({ total: totalDonations._sum.amount || 0 });
});

// PUT new donation
app.put("/events/:eventId/donations", async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const { amount, donorName } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid donation amount" });
  }

  const donation = await prisma.donation.create({
    data: { eventId, amount, donorName },
  });

  res.json(donation);
});

app.post('/create-checkout-session', async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: 'Donation' },
						unit_amount: Math.round(req.body.amount * 100),
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `http://localhost:5173/success?eventId=${req.body.eventId}`,
			cancel_url: 'http://localhost:5173/donate',
		});
		res.json({ id: session.id });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

//Removes organization request relationship
app.post('/organizations/:organizationId/remove-request', async (req, res) => {
  const { organizationId } = req.params;
  const { userId } = req.body;
  try {
    await prisma.organization.update({
      where: { id: parseInt(organizationId) },
      data: {
        requests: {
          disconnect: { id: userId },
        },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        requestedOrganizations: {
          disconnect: { id: parseInt(organizationId) },
        },
      },
    });
    res.status(200).json({ message: 'Request denied successfully' });
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({ message: 'Failed to deny request.' });
  }
});

app.listen(port, () => {
  console.log('starting');
})

