import './TemplatePage.css';
import { useState, useEffect } from 'react';

function TemplatePage({ orgId }) {
    const [activeType, setActiveType] = useState('donor');
    const [templates, setTemplates] = useState([]);
    const [newTemplateTitle, setNewTemplateTitle] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null); // for modal

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

    const handleCreateTemplate = () => {
        const endpoint = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
        const template = {
            organizationId: orgId,
            title: newTemplateTitle,
            content: newTemplateContent,
        };

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

    return (
        <div className="template-page">
            <h1>Template Manager</h1>

            <div className="template-type-toggle">
                <button className={activeType === 'donor' ? 'active' : ''} onClick={() => setActiveType('donor')}>
                    📨 Subscriber Letters
                </button>
                <button className={activeType === 'grant' ? 'active' : ''} onClick={() => setActiveType('grant')}>
                    📝 Grant Requests
                </button>
            </div>

            <div className="template-section">
                <h2>{activeType === 'donor' ? 'Subscriber letter templates' : 'Grant request templates'}</h2>
                {templates.length === 0 ? (
                    <p>No {activeType} templates yet.</p>
                ) : (
                    <div className="template-list">
                        {templates.map((template) => (
                            <div key={template.id} className="template-card">
                                <h3>{template.title}</h3>
                                <button onClick={() => setSelectedTemplate(template)}>View more</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="template-section">
                <h2>Create {activeType === 'donor' ? 'letter' : 'grant'} template</h2>
                <input
                    type="text"
                    placeholder="Template Title"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                />
                <textarea
                    placeholder="Template Content"
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                />
                <button onClick={handleCreateTemplate}>Create</button>
            </div>
            {selectedTemplate && (
            <div className="modal-overlay">
                <div className="modal-content email-style-modal">
                <span className="close-button" onClick={() => setSelectedTemplate(null)}>×</span>
                <h2>Email Preview</h2>

                <div className="email-field">
                    <label><strong>Title:</strong></label>
                    <div className="email-box">{selectedTemplate.title}</div>
                </div>

                <div className="email-field">
                    <label><strong>Message:</strong></label>
                    <div className="email-box">{selectedTemplate.content}</div>
                </div>

                <button className="send-button" onClick={() => alert("Open recipient selector")}>Send to</button>
                </div>
            </div>
            )}
        </div>
    );
}

export default TemplatePage;


// import './TemplatePage.css';
// import { useState, useEffect } from 'react';

// function TemplatePage({ orgId }) {
//     const [activeType, setActiveType] = useState('donor');
//     const [templates, setTemplates] = useState([]);
//     const [newTemplateTitle, setNewTemplateTitle] = useState('');
//     const [newTemplateContent, setNewTemplateContent] = useState('');

//     useEffect(() => {
//         if (orgId) fetchTemplates();
//     }, [orgId, activeType]);

//     const fetchTemplates = () => {
//         const endpoint = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
//         console.log("fetching templates")
//         fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/${endpoint}`)
//             .then(res => res.json())
//             .then(data => setTemplates(data))
//             .catch(err => console.error(`Error fetching ${activeType} templates:`, err));
//     };

//     const handleCreateTemplate = () => {
//         console.log("creating")
//         const endpoint = activeType === 'donor' ? 'donor-templates' : 'grant-templates';
//         const template = {
//             organizationId: orgId,
//             title: newTemplateTitle,
//             content: newTemplateContent,
//         };

//         fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/${endpoint}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(template),
//         })
//             .then(res => res.json())
//             .then(createdTemplate => {
//                 setTemplates([...templates, createdTemplate]);
//                 setNewTemplateTitle('');
//                 setNewTemplateContent('');
//                 console.log("created")
//             })
//             .catch(err => console.error(`Error creating ${activeType} template:`, err));
//     };

//     return (
//         <div className="template-page">
//             <h1>Template Manager</h1>
            
//             {/* Template Type Selector */}
//             <div className="template-type-toggle">
//                 <button
//                     className={activeType === 'donor' ? 'active' : ''}
//                     onClick={() => setActiveType('donor')}
//                 >
//                     📨 Subscriber Letters
//                 </button>
//                 <button
//                     className={activeType === 'grant' ? 'active' : ''}
//                     onClick={() => setActiveType('grant')}
//                 >
//                     📝 Grant Requests
//                 </button>
//             </div>

//             {/* Existing Templates */}
//             <div className="template-section">
//                 <h2>{activeType === 'donor' ? 'Subscriber letter templates' : 'Grant request templates'}</h2>
//                 {templates.length === 0 ? (
//                     <p>No {activeType} templates yet.</p>
//                 ) : (
//                     <ul>
//                         {templates.map((template) => (
//                             <li key={template.id} className="template-item">
//                                 <h3>{template.title}</h3>
//                                 <p>{template.content}</p>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>

//             {/* Create Template Form */}
//             <div className="template-section">
//                 <h2>Create new {activeType === 'donor' ? 'letter' : 'grant'} template</h2>
//                 <input
//                     type="text"
//                     placeholder="Template Title"
//                     value={newTemplateTitle}
//                     onChange={(e) => setNewTemplateTitle(e.target.value)}
//                 />
//                 <textarea
//                     placeholder="Template Content"
//                     value={newTemplateContent}
//                     onChange={(e) => setNewTemplateContent(e.target.value)}
//                 />
//                 <button onClick={handleCreateTemplate}>Create Template</button>
//             </div>
//         </div>
//     );
// }

// export default TemplatePage;

