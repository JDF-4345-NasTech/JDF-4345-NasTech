import {useEffect, useState} from 'react';
import {useAuth0} from "@auth0/auth0-react";
import { useHistory } from 'react-router-dom'; 
import "./CreateDonorLetter.css";

function CreateDonorLetter({ event, onClose }) {
	const {user, isAuthenticated} = useAuth0();
    const [templates, setTemplates] = useState([]);
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
    
        // Fetch templates
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${event.organizationId}/donor-templates`)
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(err => {
                console.error(`Error fetching donor templates:`, err);
        });
        console.log(templates)
    
      }, [event.organizationId]);


    const handleDonorSending = async () => {
        if (!isAuthenticated) {
			alert("Please log in to RSVP.");
			return;
		}
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/donorMail/${event.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                eventName : event.name, 
                messageBody: newTemplateContent,
              }),
            });
        
            const result = await response.json();
        
            if (response.ok) {
              alert(result.message);
            } else {
              alert(`Error: ${result.error}`);
            }
        } catch (err) {
            console.error('Failed to send emails:', err);
            alert('An error occurred while sending donor emails.');
        }
    };

    return (
        <><div className="non-profit-event-page">
			<button id='cdl-back' onClick={onClose}>
                ← Back
            </button>
            <div id="npe-event-header">
                <h1>Send an email to Donors</h1>
            </div>
            <div id="npe-body-container">
                {templates && templates.length === 0 ? (
                    <p>No saved templates yet.</p>
                ) : (
                    <div className="template-list">
                        {templates.map((template) => (
                            <div key={template.id} className="template-card">
                                <h3>{template.title}</h3>
                                <button onClick={() => setNewTemplateContent(template.content)}>View more</button>
                            </div>
                        ))}
                    </div>
                )}
            <p id="npe-details">Email Body</p>
            <textarea
                placeholder="Email Content"
                id="npe-text-area"
                value={newTemplateContent}
                onChange={(e) => setNewTemplateContent(e.target.value)}
            />
            <button onClick={handleDonorSending}>Send to Donors</button>
            </div>
        </div>
    </>
    );
};


export default CreateDonorLetter;