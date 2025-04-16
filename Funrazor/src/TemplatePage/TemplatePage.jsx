import './TemplatePage.css';
import { useState, useEffect } from 'react';

function TemplatePage({ orgId }) {
    const [templates, setTemplates] = useState([]);
    const [newTemplateTitle, setNewTemplateTitle] = useState("");
    const [newTemplateContent, setNewTemplateContent] = useState("");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/organizations/${orgId}/templates`)
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(err => console.error('Error fetching templates:', err));
    }, [orgId]);

    const handleCreateTemplate = () => {
        const template = {
            title: newTemplateTitle,
            content: newTemplateContent,
            organizationId: orgId,
        };

        fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
        })
            .then(res => res.json())
            .then((createdTemplate) => {
                setTemplates([...templates, createdTemplate]);
                setNewTemplateTitle("");
                setNewTemplateContent("");
            })
            .catch(err => console.error('Error creating template:', err));
    };

    return (
        <div className="template-page">
            <h1>Template Manager</h1>
            <div className="template-section">
                <h2>Existing Templates</h2>
                {templates.length === 0 ? (
                    <p>No templates yet.</p>
                ) : (
                    <ul>
                        {templates.map((template, idx) => (
                            <li key={idx} className="template-item">
                                <h3>{template.title}</h3>
                                <p>{template.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="template-section">
                <h2>Create New Template</h2>
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
                <button onClick={handleCreateTemplate}>Create Template</button>
            </div>
        </div>
    );
}

export default TemplatePage;
