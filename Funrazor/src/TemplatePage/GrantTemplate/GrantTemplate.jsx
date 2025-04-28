import React, { useState } from 'react';
import jsPDF from 'jspdf';
import '../TemplatePage.css';

export default function GrantTemplate({ template }) {
  const [fields, setFields] = useState({
    projectTitle: template.title || '',
    executiveSummary: '',
    objectives: '',
    budget: '',
    timeline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    // helper to add section with automatic page breaks
    const addSection = (heading, text) => {
      // heading
      if (y + 20 > pageHeight - margin) {
        doc.addPage(); y = margin;
      }
      doc.setFontSize(14);
      doc.text(heading, margin, y);
      y += 20;

      // body
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(text || '', doc.internal.pageSize.getWidth() - margin * 2);
      lines.forEach(line => {
        if (y + 14 > pageHeight - margin) {
          doc.addPage(); y = margin;
        }
        doc.text(line, margin, y);
        y += 14;
      });
      y += 20; // spacing after section
    };

    // Title
    doc.setFontSize(18);
    doc.text(fields.projectTitle || 'Grant Proposal', margin, y);
    y += 30;

    // Sections
    addSection('Executive Summary', fields.executiveSummary);
    addSection('Objectives', fields.objectives);
    addSection('Budget', fields.budget);
    addSection('Timeline', fields.timeline);

    // save
    const filename = (fields.projectTitle ? fields.projectTitle.trim() : 'grant') + '.pdf';
    doc.save(filename);
  };

  return (
    <div className="grant-form">
      <div className="form-group">
        <label>Project Title</label>
        <input
          type="text"
          name="projectTitle"
          value={fields.projectTitle}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Executive Summary</label>
        <textarea
          name="executiveSummary"
          rows={4}
          value={fields.executiveSummary}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Objectives</label>
        <textarea
          name="objectives"
          rows={4}
          value={fields.objectives}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Budget</label>
        <textarea
          name="budget"
          rows={3}
          value={fields.budget}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Timeline</label>
        <textarea
          name="timeline"
          rows={3}
          value={fields.timeline}
          onChange={handleChange}
        />
      </div>

      <button className="send-button" onClick={downloadPdf}>
        Download Grant PDF
      </button>
    </div>
  );
}
