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
          text: `Hello,\n\nYou have successfully RSVP'd with response: ${response}\n\nEvent: ${eventName}\nDate: ${new Date(eventDate).toLocaleDateString()}\n\nThank you for your response!\n\n- Funrazor Team`,
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
      text: `${orgName} posted a new event!\n\nEvent: ${eventName}\nDate: ${new Date(eventDate).toLocaleDateString()}\nAbout: ${eventDescription}\n\n Check ${orgName}'s page for more info on attending or donating to this event! - Funrazor Team`,
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
    const { name, date, location, description, organizationId, donationGoal } = req.body;
    try {
        const newEvent = await prisma.event.create({
            data: {
                name,
                date,
                location,
                description,
                organizationId,
                donationGoal: parseFloat(donationGoal),
                donationTotal: 0,
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
app.get('/subscribers/:organizationId', async (req, res) => {
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
  console.log('Fetching organization with ID:', req.params.organizationId);
  const { organizationId } = req.params; // Extract organizationId from params

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) },
      include: {
        requests: true, // Include the list of users who have requested to join
      },
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

// Backend API to search for an organization by name
app.get('/organization/search', async (req, res) => {
  const { name } = req.query;
  console.log("Looking for org")
  console.log(name)
  if (!name) {
    return res.status(400).json({ error: 'Organization name is required.' });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { name: name },
    });

    if (organization) {
      res.status(200).json(organization);
    } else {
      res.status(404).json(null); // No organization found
    }
  } catch (error) {
    console.error('Error checking organization:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// GET endpoint for retrieving donations for a specific event
app.get('/donations/:eventId', async (req, res) => {
  const { eventId } = req.params;
  
  if (!eventId) {
    return res.status(400).json({ error: 'Missing event ID.' });
  }

  try {
    const donations = await prisma.donation.findMany({
      where: {
        eventId: parseInt(eventId, 10),
      },
      select: {
        donorName: true, 
        amount: true, 
        tipIncluded: true,
      },
    });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ error: 'No donations found for this event.' });
    }
    const totalDonations = donations.reduce((total, donation) => total + donation.amount, 0);

    res.status(200).json({
      eventId: eventId,
      donations: donations,
      totalDonations: parseFloat(totalDonations.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations.' });
  }
});

// GET endpoint to fetch the requests for an organization
app.get('/org/:id/requests', async (req, res) => {
  const { id } = req.params;
  console.log("looking for org requests")
  try {
    const org = await prisma.organization.findUnique({
      where: { id: parseInt(id) },
      include: {
        requests: true, // Include the list of users who have requested to join
      },
    });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found.' });
    }
    res.status(200).json(org.requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
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

// Stripe donation
app.post('/create-checkout-session', async (req, res) => {
  const { amount, eventId, userEmail, tipIncluded } = req.body;
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
			success_url: `http://localhost:5173/success?eventId=${eventId}&amount=${amount}&userEmail=${encodeURIComponent(userEmail)}&tipIncluded=${tipIncluded}`,
			cancel_url: 'http://localhost:5173/donate',
		});
		res.json({ id: session.id });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// POST endpoint to request to join an organization
app.post('/organizations/:organizationId/request-join', async (req, res) => {
  const { organizationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'No user ID provided.' });
  }

  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    // Check if the user is already a part of the organization (either as an admin or subscriber)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (existingUser && existingUser.organizationId === organization.id) {
      return res.status(400).json({ error: 'User is already a part of this organization.' });
    }

    // Add the user to the requests list for that organization
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        requestedOrganizationId: parseInt(organizationId), // Set the requested org id
      },
    });

    res.status(200).json({ message: 'Request to join the organization sent.', user: updatedUser });
  } catch (error) {
    console.error('Error processing join request:', error);
    res.status(500).json({ error: 'Failed to process the join request.' });
  }
});


// Removes organization request relationship
app.patch('/organizations/:organizationId/remove-request', async (req, res) => {
  const { organizationId } = req.params;
  const { userId } = req.body;
  try {
    const updatedOrganization = await prisma.organization.update({
      where: { id: parseInt(organizationId) },
      data: {
        requests: {
          disconnect: { id: userId }, // Remove the user from the requests list
        },
      },
    });

    res.status(200).json(updatedOrganization);
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({ message: 'Failed to deny request.' });
  }
});

// create donation
app.post('/donation/success', async (req, res) => {
  const { eventId, amount, userEmail, tipIncluded } = req.body;
  
  try {
    const parsedAmount = parseFloat(amount);
    const finalAmount = tipIncluded ? parsedAmount * 0.95 : parsedAmount;

    const [newDonation, updatedEvent] = await prisma.$transaction([
      prisma.donation.create({
        data: {
          amount: parsedAmount,
          donorName: userEmail,
          eventId: parseInt(eventId),
          tipIncluded: tipIncluded,
        },
      }),
      prisma.event.update({
        where: { id: parseInt(eventId) },
        data: {
          donationTotal: {
            increment: Math.round(finalAmount),
          },
        },
      }),
    ]);

    res.status(201).json({ 
      message: 'Donation created successfully', 
      donation: newDonation, 
      updatedEvent 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// GET all grant templates for an organization
app.get('/organizations/:orgId/grant-templates', async (req, res) => {
  const orgId = parseInt(req.params.orgId);
  try {
    const templates = await prisma.grantTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { id: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching grant templates:', error);
    res.status(500).json({ error: 'Failed to fetch grant templates' });
  }
});

// POST a new grant template
app.post('/grant-templates', async (req, res) => {
  const { organizationId, title, content } = req.body;

  if (!organizationId || !title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTemplate = await prisma.grantTemplate.create({
      data: {
        organizationId,
        title,
        content,
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating grant template:', error);
    res.status(500).json({ error: 'Failed to create grant template' });
  }
});

// GET all donor templates for an organization
app.get('/organizations/:orgId/donor-templates', async (req, res) => {
  const orgId = parseInt(req.params.orgId);
  try {
    const templates = await prisma.donorTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { id: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching donor templates:', error);
    res.status(500).json({ error: 'Failed to fetch donor templates' });
  }
});

// POST a new donor template
app.post('/donor-templates', async (req, res) => {
  const { organizationId, title, content } = req.body;

  if (!organizationId || !title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTemplate = await prisma.donorTemplate.create({
      data: {
        organizationId,
        title,
        content,
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating donor template:', error);
    res.status(500).json({ error: 'Failed to create donor template' });
  }
});

app.listen(port, () => {
  console.log('starting');
})

