Template.chatInterface.events({
    'click #send-button': async function() {
      const userInput = document.getElementById('user-input').value;
      const chatBox = document.getElementById('chat-box');
  
      // Append user message to chat box
      chatBox.innerHTML += `<div>User: ${userInput}</div>`;
  
      // Clear the input field
      document.getElementById('user-input').value = '';
  
      // Make an API call to the backend
      const response = await fetch('http://localhost:4000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
  
      const data = await response.json();
  
      // Append bot's reply to chat box
      chatBox.innerHTML += `<div>Bot: ${data}</div>`;
    },

  });
  Template.chatInterface.rendered = function() {
    // Initialize the chat box with a welcome message
    document.getElementById('chat-box').innerHTML = 
      '<div>Bot: Welcome to the chat!</div>';
  }
  