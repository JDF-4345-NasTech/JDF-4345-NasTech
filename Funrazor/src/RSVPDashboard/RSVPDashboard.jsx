import './RSVPDashboard.css';
import { useState, useEffect } from 'react';

const RSVPDashboard = ({ event }) => {
  const [rsvps, setRsvps] = useState([]);
  const [statusSummary, setStatusSummary] = useState([0, 0, 0]); // Default to an array with 3 elements
  const statusArray = ['Confirmed', 'Maybe', 'No'];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/rsvps/${event.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRsvps(data.rsvps);
        setStatusSummary(data.statusSummary);
      })
      .catch((err) => console.error('Error fetching RSVPs:', err));
  }, [event]);

  if (!rsvps) {
    return <div>Loading...</div>;
  }

  const handleExport = () => {
    const headers = ['Email', 'Status']; // Removed 'Name' from the headers
    const rows = rsvps.map(rsvp => [rsvp.email, rsvp.response]); // Removed 'name' from the row data
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.name}_RSVPs.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h1>Event: {event.name}</h1>
      <h3>RSVPs</h3>
      <table id='rsvp_stats'>
        <thead>
          <tr>
            <th className="yCol">Confirmed</th>
            <th className="mCol">Maybe</th>
            <th className="nCol">No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="yCol">{statusSummary.Yes !== undefined ? statusSummary.Yes : 0}</td>
            <td className="mCol">{statusSummary.Maybe !== undefined ? statusSummary.Maybe : 0}</td>
            <td className="nCol">{statusSummary.No !== undefined ? statusSummary.No : 0}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleExport}>Export RSVPs</button>
      <h3>RSVP List</h3>
      <table id='rsvp_list'>
        <thead>
          <tr id='rsvp_header'>
            <th id='email-header'>Email</th>
            <th id='status-header'>Status</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((rsvp, index) => (
            <tr key={index} className="rsvp-row">
              <td>{rsvp.email}</td> {/* Removed name field */}
              <td>{rsvp.response}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default RSVPDashboard;

