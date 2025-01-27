function getConfirmationTemplate(guestDetails, eventDetails) {
    const { guestName } = guestDetails;
    const { eventName, eventDate, eventTime, eventLocation } = eventDetails;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                }
                .header {
                    text-align: center;
                    background-color: #f4f4f4;
                    padding: 10px 0;
                    border-bottom: 1px solid #ddd;
                }
                .content {
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Thank You for RSVPing!</h2>
                </div>
                <div class="content">
                    <p>Hi ${guestName},</p>
                    <p>Thank you for confirming your attendance to the following event:</p>
                    <ul>
                        <li><strong>Event:</strong> ${eventName}</li>
                        <li><strong>Date:</strong> ${eventDate}</li>
                        <li><strong>Time:</strong> ${eventTime}</li>
                        <li><strong>Location:</strong> ${eventLocation}</li>
                    </ul>
                    <p>We can't wait to see you there!</p>
                    <p>If you have any questions or need to make changes to your RSVP, please contact us.</p>
                </div>
                <footer style="text-align: center; padding-top: 10px; color: #888;">
                    <p>&copy; 2025 RSVP System. All rights reserved.</p>
                </footer>
            </div>
        </body>
        </html>
    `;
}
