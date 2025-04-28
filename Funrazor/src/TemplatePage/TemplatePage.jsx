import './TemplatePage.css';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

function TemplatePage({ orgId }) {
  const [activeType, setActiveType] = useState('donor');
  const [templates, setTemplates] = useState([]);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Fetch templates when org or type changes
  useEffect(() => {
    if (orgId) fetchTemplates();
  }, [orgId, activeType]);

  const fetchTemplates = () => {
    const endpoint = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/${endpoint}`)
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(err => console.error(`Error fetching ${activeType} templates:`, err));
  };

  // Fetch subscribers once (only used for donor)
  useEffect(() => {
    if (orgId && activeType === 'donor') {
      fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/subscribers/${orgId}`)
        .then(res => res.json())
        .then(data => setSubscribers(data.map(s => s.user)))
        .catch(err => console.error('Error fetching subscribers:', err));
    }
  }, [orgId, activeType]);

  const handleCreateTemplate = () => {
    const endpoint = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
    const template = { organizationId: orgId, title: newTemplateTitle, content: newTemplateContent };

    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    })
      .then(res => res.json())
      .then(createdTemplate => {
        setTemplates([...templates, createdTemplate]);
        setNewTemplateTitle('');
        setNewTemplateContent('');
      })
      .catch(err => console.error(`Error creating ${activeType} template:`, err));
  };

  // Toggle individual email
  const toggleEmail = (email) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  // Toggle all selection
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(subscribers.map(u => u.id)));
    }
    setSelectAll(!selectAll);
  };

  // Send template emails
  const sendTemplateEmails = () => {
    const emails = Array.from(selectedEmails);
    if (!emails.length) return alert('Pick at least one subscriber.');

    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/templateMail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, subject: selectedTemplate.title, text: selectedTemplate.content, orgId }),
    })
      .then(res => res.json())
      .then(() => {
        alert('Emails sent!');
        setShowSendDialog(false);
        setSelectedTemplate(null);
      })
      .catch(err => {
        console.error('Error sending template emails:', err);
        alert('Failed to send emails.');
      });
  };

  // Download selected grant as PDF
  const downloadGrantPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(selectedTemplate.title, 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(selectedTemplate.content, 180);
    doc.text(lines, 10, 30);
    doc.save(`${selectedTemplate.title}.pdf`);
  };

  return (
    <div className="template-page">
      <h1>Templates</h1>

      <div className="template-type-toggle">
        <button className={activeType === 'donor' ? 'active' : ''} onClick={() => setActiveType('donor')}>
          📨 Subscriber Letters
        </button>
        <button className={activeType === 'grant' ? 'active' : ''} onClick={() => setActiveType('grant')}>
          📝 Grant Requests
        </button>
      </div>

      <div className="template-section collapsible-section">
        <div className="collapsible-header" onClick={() => setIsCreateOpen(prev => !prev)}>
          <h2>{isCreateOpen ? '▼' : '▶'} Create {activeType === 'donor' ? 'letter' : 'grant'} template</h2>
        </div>

        {isCreateOpen && (
          <div className="collapsible-body">
            <input
              type="text"
              placeholder="Template Title"
              value={newTemplateTitle}
              onChange={e => setNewTemplateTitle(e.target.value)}
            />
            <textarea
              placeholder="Template Content"
              value={newTemplateContent}
              onChange={e => setNewTemplateContent(e.target.value)}
            />
            <button onClick={handleCreateTemplate}>Create</button>
          </div>
        )}
      </div>

      <div className="template-section">
        <h2>{activeType === 'donor' ? 'Subscriber letter templates' : 'Grant request templates'}</h2>
        {templates.length === 0 ? (
          <p>No {activeType} templates yet.</p>
        ) : (
          <div className="template-list">
            {templates.map(template => (
              <div key={template.id} className="template-card">
                <h3>{template.title}</h3>
                <button onClick={() => setSelectedTemplate(template)}>View more</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content email-style-modal">
            <span className="close-button" onClick={() => setSelectedTemplate(null)}>×</span>
            <h2>Preview</h2>

            <div className="email-field">
              <label><strong>Title:</strong></label>
              <div className="email-box">{selectedTemplate.title}</div>
            </div>

            <div className="email-field">
              <label><strong>Message:</strong></label>
              <div className="email-box">{selectedTemplate.content}</div>
            </div>

            {/* Conditional actions */}
            {activeType === 'donor' ? (
              !showSendDialog ? (
                <button className="send-button" onClick={() => setShowSendDialog(true)}>
                  Send to
                </button>
              ) : (
                <div className="subscriber-selection">
                  <label>
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /> Select All
                  </label>
                  <div className="subscriber-list">
                    {subscribers.map(u => (
                      <label key={u.id}>
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(u.id)}
                          onChange={() => toggleEmail(u.id)}
                        />
                        <span className="subscriber-text">
                            {u.firstName} {u.lastName} {u.id}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button onClick={sendTemplateEmails}>Confirm Send</button>
                </div>
              )
            ) : (
              <button className="send-button" onClick={downloadGrantPdf}>
                Download as PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatePage;

