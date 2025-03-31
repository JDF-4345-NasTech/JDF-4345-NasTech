# JDF-4345-NasTech

# FUNRAZOR

**FUNRAZOR** is a React-based application designed to streamline event creation and management for non-profit organizations. This project includes functionality for creating events, selecting locations (states and cities), and displaying a list of events, providing a starting point for further development.

---

## Release Notes

### Version 0.4.0
---
### Features

1. **Admin requests**
   - Users have the ability to request admin access to an organization, allowing them to make events
   - Admins can view requests and accept or deny them
   
2. **Export RSVP list**
   - Event admins can now export the event's rsvps via a csv file
   
3. **UI overhaul**
   - Modernization updates to every existing page
   - Fonts, colors, placements, and sizes were changed to appear more professional
   
### Bug Fixes

1. **Improved Stripe interface**
   - The Donations page now fully updates the bar
   - Donators are displayed on the admin end 
   - Funrazor validates donations by sending receipts

2. **UI bugs were fixed**
   - CSS rules are no longer unintentionally affecting components from other pages

### Known Issues

- Process of creating an admin request will be overhauled
- RSVPs aren't created with the names, leading to empty slots
- RSVP options are available for past events, which should be disabled.
---

### Version 0.3.0
---
### Features

1. **Donation Page**
   - Users have the option to donate to an event
   - Implemented with stripe.
   - Donations are tracked on the Event page
   
2. **Organization Subsciptions**
   - Introduced sevral ways for users to subscribe to non-profit organizations.
   - Implemented backed and database support to add and remove a user
   - Organizations will send an email to their subscribers when they form an event
   
3. **UI overhaul**
   - Comprehensive updates to every existing page
   - User navigation features were added and moved.
   
### Bug Fixes

- **Fixed API call issues for fetching organizations**
  - Improved error handling to avoid crashes when retrieving organization data.
  
- **Fixed RSVP API calls**
  - RSVP counts now displays the correct numbers.
  - Users are now limited to 1 RSVP per event, which they can update in the event page
  - RSVP modal is now functional

### Known Issues

- RSVP options are available for past events, which should be disabled.
- UI could be modernized, with changes to page layout, icons, fonts and colors pending. 
- Stripe donation still needs to be thoroughly tested
---

### Version 0.2.0

This section outlines all updates and features introduced in the current release.

---

### Features

1. **Email Notifications for RSVP**
   - When a user RSVPs for an event, an email confirmation is automatically sent.
   - Implemented with nodemailer.
   - Emails are sent from a Funrazor App gmail account.
   
3. **Organization Discovery Page**
   - Introduced a new page for users to discover and explore non-profit organizations.
   - Implemented `Organizations.jsx` to fetch and display organization details dynamically.
   
4. **Event Details Page**
   - Users can now view detailed event information, including images, goals, RSVP status, and donation progress.
   - The page dynamically updates RSVP counts as users submit responses.
   - Integrated the RSVP pop-up modal directly within the event details page.
   
### Bug Fixes

- **Fixed API call issues for fetching organizations**
  - Improved error handling to avoid crashes when retrieving organization data.
  
- **RSVP Pop-Up Accessibility**
  - Created RSVP to be a pop up modal.

### Known Issues

- Users can RSVP multiple times instead of updating their existing RSVP.
- RSVP options are available for past events, which should be disabled.
- Some event calls are used to access rsvp count, and 0 rsvps are displayed. 

---

### Version 0.1.0

---

## Frontend Updates

1. **Authentication**:
   - Integrated **Auth0** for user authentication with `LoginButton.jsx` and `LogoutButton.jsx`.
   - Ensures secure access and supports non-profit administrators and attendees.

2. **Event Management**:
   - **CreateEvent.jsx**:
     - Enables users to create events with dynamic state and city suggestions using the `countrystatecity.in` API.
     - Adds new events to the database through a form submission workflow.
   - **EventListItem.jsx**:
     - Displays event details such as images, RSVPs, and donation progress.

3. **RSVP System**:
   - **RsvpPopUp.jsx**:
     - Allows users to RSVP for events with options like "Yes," "No," or "Maybe."
     - Supports event organizers in tracking attendance.

4. **Non-Profit Dashboard**:
   - **NonProfitHome.jsx**:
     - Displays current and past events with filtering options.
     - Allows administrators to create events and view detailed pages for each event.

5. **Styling Improvements**:
   - Introduced responsive designs across components.
   - Enhanced styling with consistent hover effects and modal dialogs.

---

## Backend Updates

1. **Core Configuration**:
   - Backend built with **Express.js** for handling API requests.
   - ORM integration with **Prisma** for database management.
   - Database: PostgreSQL with schema defined in `schema.prisma`.

2. **API Endpoints**:
   - Implemented RESTful endpoints in `index.js` for managing events, organizations, and user interactions.

3. **Description Management**:
   - Added **descriptionController.js** and **descriptionModel.js** for handling descriptions (likely for events or organizations).

4. **Database Migrations**:
   - Managed migrations using Prisma with files such as `migration.sql` and `migration_lock.toml`.

5. **Dependencies**:
   - Key dependencies include:
     - `@prisma/client`: Database interactions.
     - `express`: Server framework.
     - `cors`: Middleware for cross-origin requests.

---

## Deployment and Environment Setup

1. **Frontend**:
   - Run `npm install` in the frontend directory to install dependencies.
   - Start the development server using `npm start`.

2. **Backend**:
   - Run `npm install` in the backend directory to install dependencies.
   - Configure the `.env` file with database credentials and Auth0 settings.
   - Start the server with `node index.js` or `npm start`.

3. **Database**:
   - Use the Prisma CLI for migrations:
     - `npx prisma migrate dev` to apply migrations.

---


### Version 0.0.0

#### Features
- **Event Creation Form**:
  - Fields for event name, date, time, state, city, and description.
  - Dynamic suggestions for states and cities based on user input using external API (`countrystatecity.in`).
  - Cascading logic to enable city selection only after a state is selected.
  - Event added to database when form is submitted.
- **Event List Display**:
  - Displays the list of events belonging to organization with basic details like name, date, RSVPs, and donation progress.
- **Routing**:
  - Integrated `react-router-dom` for navigation between the home page and the event creation form.

#### Bug Fixes
- No bug fixes were included in this version since this is the initial release.

#### Known Issues
- **State and City API Dependence**: Application depends on an external API with an access key that may have rate limits or expiration issues.
- **Event Image Placeholder**: Dummy event data includes a placeholder for event images that are not yet implemented.
- **CSS Styling Improvements**: Basic styling is applied, but additional refinement and responsive design improvements are needed.

---

## Technology Stack

- **Frontend Framework**: React.js
- **Routing**: React Router (react-router-dom)
- **CSS**: Basic custom styles for UI components
- **API**: External data source (`countrystatecity.in`) for fetching states and cities.
- **Language**: JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL

---

## Rationale for Features in Version 0.0.0

The features implemented in this release were selected to establish a foundational user interface, test external API integration, and initialize our database. By focusing on creating and listing events, we aim to:
1. **Validate Core Functionality**: Establish basic UI and functionality for event creation, forming the foundation for further iterations.
2. **Assess API Integration**: Evaluate the integration of external data sources for real-time user interactions.
3. **Connect Backend to Frontend**: Set up basic frontend and backend communication through basic RESTful API GET and PUSH calls.
4. **Initialize Database Relations**: Creating models for organizations and their events in the database allows us to demonstrate our database relationship tables.
5. **Team Skill Assessment**: Allow team members to familiarize themselves with React and assess proficiency in state management and routing.

---

## Known Limitations and Next Steps

- **Enhanced Styling**: Implementing advanced CSS or integrating a design framework like Material-UI for a polished user experience.
- **Error Handling**: Adding robust error handling for API calls.
- **Responsive Design**: Ensuring backend calls are synced with user actions.

---

This initial version serves as a foundation to test the technical stack and prepare for the next phase of development, ensuring alignment with project goals and team capabilities.

**Demo**: https://drive.google.com/file/d/136ploTL-u0elk9si2jT9IChC5W9E8DUJ/view?usp=sharing
