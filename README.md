# JDF-4345-NasTech

# FUNRAZOR

**FUNRAZOR** is a React-based application designed to streamline event creation and management for non-profit organizations. This project includes functionality for creating events, selecting locations (states and cities), and displaying a list of events, providing a starting point for further development.

---

## Release Notes

### Version 1.0.0
---
### Features
1. **Authentication**:
   - Integrated **Auth0** for user authentication with `LoginButton.jsx` and `LogoutButton.jsx`.
   - Ensures secure access and supports non-profit administrators and attendees.

2. **Organization Discovery Page**
   - Introduced a new page for users to discover and explore non-profit organizations.
   - Implemented `Organizations.jsx` to fetch and display organization details dynamically.

3. **Event Management**:
   - **CreateEvent.jsx**:
     - Enables users to create events with dynamic state and city suggestions using the `countrystatecity.in` API.
     - Adds new events to the database through a form submission workflow.
   - **EventListItem.jsx**:
     - Displays event details such as date, time, RSVPs, and donation progress.   

4. **RSVP to events**
   - Users can rsvp to any event that is available
   - When a user RSVPs for an event, an email confirmation is automatically sent from a Funrazor App gmail account.
   - Implemented with nodemailer.
   
5. **Donation Page**
   - Users have the option to donate to an event
   - Implemented with stripe.
   - Donations are tracked on the Event page

6. **Organization Subsciptions**
   - Introduced several ways for users to subscribe to non-profit organizations.
   - Implemented backed and database support to add and remove a user
   - Organizations will send an email to their subscribers when they form an event

7. **Event Details Page**
   - Users can now view detailed event information, including images, goals, RSVP status, and donation progress.
   - The page dynamically updates RSVP counts as users submit responses.
   - Integrated the RSVP pop-up modal directly within the event details page.

8. **Admin requests**
   - Users have the ability to invite users to be admins for their organization
   - Once users accept, they'll have the ability to participate as an admin
   
9. **Export RSVP list**
   - Event admins can export the event's rsvps via a csv file

10. **Templates editor**
   - Organization admins can use the templates editor in the sidebar, where they can set up, edit and store donor message and grant messages

11. **Donor messages**
   - Organizations can automatically send custom or preset messages to the donors of each event
   
12. **UI overhaul**
   - Modernization updates to every existing page
   - Fonts, colors, placements, and sizes were changed to appear more professional

13. **Core Configuration**:
   - Backend built with **Express.js** for handling API requests.
   - ORM integration with **Prisma** for database management.
   - Database: PostgreSQL with schema defined in `schema.prisma`.

14. **API Endpoints**:
   - Implemented RESTful endpoints in `index.js` for managing events, organizations, and user interactions.

15. **Database Migrations**:
   - Managed migrations using Prisma with files such as `migration.sql` and `migration_lock.toml`.

16. **Dependencies**:
   - Key dependencies include:
     - `@prisma/client`: Database interactions.
     - `express`: Server framework.
     - `cors`: Middleware for cross-origin requests.   ### Bug Fixes

17. **Improved Stripe interface**
   - The Donations page now fully updates the bar
   - Donators are displayed on the admin end 
   - Funrazor validates donations by sending receipts

### Bug Fixes

- Stripe interface now updates the database reliably
- CSS rules no longer unintentionally affect components on separate files
- Calls to gather RSVP counts now display the correct numbers
- Users are now limited to 1 RSVP per event, which they can update in the event page
- RSVP dashboard is moved to the Event Details page, where it loads properly as a pop up modal


### Known Issues

- Grant Requests Templates could be fleshed out to match unique requirements
- RSVP options are available for past events, which should be disabled.
- State and City API Dependence: Application depends on an external API with an access key that may have rate limits or expiration issues.

---
**Install Guide**

