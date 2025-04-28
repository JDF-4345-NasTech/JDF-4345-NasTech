import './TemplatePage.css';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import GrantTemplate from './GrantTemplate/GrantTemplate';

export default function TemplatePage({ orgId }) {
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

  // fetch templates
  useEffect(() => {
    if (!orgId) return;
    const ep = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/${ep}`)
      .then(r => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, [orgId, activeType]);

  // fetch subscribers
  useEffect(() => {
    if (orgId && activeType === 'donor') {
      fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/subscribers/${orgId}`)
        .then(r => r.json())
        .then(data => setSubscribers(data.map(s => s.user)))
        .catch(console.error);
    }
  }, [orgId, activeType]);

  const toggleEmail = email => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedEmails(prev => {
      if (selectAll) return new Set();
      return new Set(subscribers.map(u => u.id));
    });
    setSelectAll(x => !x);
  };

  const sendTemplateEmails = () => {
    const emails = Array.from(selectedEmails);
    if (!emails.length) return alert('Select at least one subscriber');
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/templateMail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, subject: selectedTemplate.title, text: selectedTemplate.content, orgId })
    })
      .then(r => r.json())
      .then(() => {
        alert('Sent');
        setSelectedTemplate(null);
        setShowSendDialog(false);
      })
      .catch(console.error);
  };

const handleCreateTemplate = () => {
    const endpoint = activeType === 'donor'
      ? 'donor-templates'
      : 'grant-templates';
  
    const payload = {
      organizationId: orgId,
      title: newTemplateTitle,
      content: newTemplateContent,
    };
  
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(created => {
        setTemplates(ts => [...ts, created]);
        setNewTemplateTitle('');
        setNewTemplateContent('');
        setIsCreateOpen(false);
      })
      .catch(console.error);
  };

  // download existing grant
  const downloadExistingGrant = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(selectedTemplate.title, 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(selectedTemplate.content, 180);
    doc.text(lines, 10, 30);
    doc.save(`${selectedTemplate.title}.pdf`);
    setSelectedTemplate(null);
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

      {/* create new block */}
      <div className="template-section collapsible-section">
        <div className="collapsible-header" onClick={() => setIsCreateOpen(o => !o)}>
          <h2>{isCreateOpen ? '▼' : '▶'} Create {activeType === 'donor' ? 'letter' : 'grant'} template</h2>
        </div>
        {isCreateOpen && (
          <div className="collapsible-body">
            <input
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

      {/* list of templates with suggested grant */}
      <div className="template-section">
        <h2>{activeType === 'donor' ? 'Subscriber letter templates' : 'Grant request templates'}</h2>

        <div className="template-list">
          {activeType === 'grant' && (
            <div className="template-card">
              <h3>Suggested template</h3>
              <button onClick={() => setSelectedTemplate({ suggested: true })}>Fill out</button>
            </div>
          )}

          {templates.map(t => (
            <div key={t.id} className="template-card">
              <h3>{t.title}</h3>
              <button onClick={() => setSelectedTemplate({ ...t, suggested: false })}>
                {activeType === 'donor' ? 'View more' : 'Download'}
              </button>
            </div>
          ))}

          {!templates.length && <p>No {activeType} templates yet.</p>}
        </div>
      </div>

      {/* modal */}
      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content">
          <span
                className="close-button"
                onClick={() => {
                    setSelectedTemplate(null);
                    setShowSendDialog(false);
                }}
                >×</span>
            {selectedTemplate.suggested ? (
              <GrantTemplate template={{ title: '', content: '' }} />
            ) : activeType === 'donor' ? (
              // donor preview and send flow
              <>
            {/* Subject line */}
            <div className="email-field">
                <label>Subject:</label>
                <div className="email-box">{selectedTemplate.title}</div>
            </div>

            {/* Message body */}
            <div className="email-field">
                <label>Message:</label>
                <div className="email-box">{selectedTemplate.content}</div>
            </div>

            {!showSendDialog ? (
                <button onClick={() => setShowSendDialog(true)}>Send to</button>
            ) : (
                <div className="subscriber-selection">
                <label>
                    <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    />{' '}
                    Select all subscribers
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
            )}
              </>
            ) : (
                downloadExistingGrant()
            )}
          </div>
        </div>
      )}
    </div>
  );
}




