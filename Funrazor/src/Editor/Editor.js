// Initialize the Quill editor
const quill = new Quill('#editor-container', {
    theme: 'snow', // 'snow' is a clean theme for Quill
    placeholder: 'Write the description of your organization here...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }], // Add headers
        ['bold', 'italic', 'underline', 'strike'], // Toggle formatting
        [{ list: 'ordered' }, { list: 'bullet' }], // Add lists
        ['link', 'image'], // Insert links and images
        [{ align: [] }], // Align text
        ['clean'] // Remove formatting
      ]
    }
  });
  
  // Handle saving the description
  document.getElementById('save-button').addEventListener('click', () => {
    // Get the HTML content of the editor
    const descriptionHtml = quill.root.innerHTML;
  
    // Example: Save it to localStorage or send it to a server
    localStorage.setItem('organizationDescription', descriptionHtml);
  
    alert('Description saved successfully!');
  });
  