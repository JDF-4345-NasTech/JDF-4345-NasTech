import './RSVPDashboard.css'
import { useState, useEffect } from 'react';

function RSVPDashboard({ isOpen, onClose, event})  {
    if (!isOpen) return null;
    
    const [rsvps, setRsvps] = useState([]);
    const [statusSummary, setStatusSummary] = useState({});

    const statusArray = ["Confirmed", "Maybe", "No"];

    useEffect(() => {
        const fetchRSVPs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvps/${event.id}`);
                const data = await response.json();
                setRsvps(data.rsvps);
                setStatusSummary(data.statusSummary);
            } catch (error) {
                console.error('Error fetching RSVPs:', error);
            }
        };

        fetchRSVPs();
    }, [event]);


  return (
    //TODO: get the real encodings for statusSummary
    <div className="rsvp-overlay" onClick={onClose}>
        <div className="rsvp-content" onClick={(e) => e.stopPropagation()}>
            <button id='rsvp_button' onClick={onClose}>Back</button>
            <h1>Event {event.id} : {event.name}</h1>
            <h3>RSVPs</h3>
            <table id='rsvp_stats'>
                <tr>
                    <th class="yCol">Confirmed</th>
                    <th class="mCol">Maybe</th>
                    <th class="nCol">No</th>
                </tr>
                <tr>
                    <td class="yCol">{statusSummary[0] || 0}</td>
                    <td class="mCol">{statusSummary[1] || 0}</td>
                    <td class="nCol">{statusSummary[2] || 0}</td>
                </tr>
            </table>
            <h3>RSVP List</h3>
            
            <table id='rsvp_list'>
                <tr id='rsvp_header'>
                    <th id='name-header'>Name</th>
                    <th id='email-header'>Email</th>
                    <th id='status-header'>Status</th>
                </tr>
                {rsvps.map((rsvp) => (
                    <tr class="rsvp-row">
                        <td>{rsvp.lname}, {rsvp.fname}</td>
                        <td>{rsvp.email}</td>
                        <td>{statusArray[rsvp.status]}</td>
                    </tr>
                ))}
            </table>
        </div>
    </div>
  );
}

export default RSVPDashboard