import React from 'react';
import { useEffect, useState } from 'react';
import {splitVarDeclarationAndRules} from "../../lib/detectors/detectors";

function ChatReact () {
   const [messages, setMessages] = useState([]);
   const [userInput, setUserInput] = useState('');
   const [displayOptions, setDisplayOptions] = useState(false);
   

    useEffect(() => {
        // Initialize the chat box with a welcome message
        const welcomeMessage = { user: 'Assistant', message: 'Welcome to the chat! Select an option or type your query'  };
   
        setMessages([welcomeMessage]);
        setDisplayOptions(true);
      }
    , []);

    async function sendQuery(message) {
        console.log("sending query" + message)
        const response = await fetch('http://localhost:4000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message}),
      });
      const data = await response.json();
      const assistantMessage = { user: 'Assistant', message: data };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      console.log(messages)
    } 





  function handleSendClick() {
    const userMessage = { user: 'User', message: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    sendQuery(userInput);
   }
    
    const [prompts, setprompts] = useState(["Give Suggestions","just testing"]);
    function handlePromptQuery() {
        //GET WORKSPACE DATA
        console.log("prompting query")
        let code = $('#compiledBlockly').val();
        var workspacedata = splitVarDeclarationAndRules(code);
        getHighLevelConcepts(workspacedata);
        
    };
   
    function getHighLevelConcepts(workspacedata) {
        let description= $('input[name=detectorname]').val()
        let highlvlconcepts = []
        workspacedata[1].forEach(rule => {
            console.log(rule)
            let highlvlconcept = rule.split("=")[0]
            console.log(highlvlconcept)
            highlvlconcepts.push(highlvlconcept)
            
        });
        console.log(highlvlconcepts)

    
        const query_prompt = "the user brainstormed categories "+ highlvlconcepts.join(' ') + " for the situation " + description + " what are some other categories that might be relevant?"
        
        sendQuery(query_prompt);

    }



  

   
//    message = {"user":  bot ^user , "message" : message}
    return (
        <div id="chat-container">
        <div id="chat-box">
            {messages.map((message, index) => (
            <div key={index}  className={`message ${message.user}`}>
                {message.user}: {message.message}
            </div>
            ))}


            {displayOptions &&
            <div id="prompt-container">
            
             {prompts.map((prompt, index) => (
                    <div key={index} className="prompt" onClick={handlePromptQuery}>
                       {prompt}
                    </div>
                ))}
           
            </div>
            }
            

            
        </div>
        <div id="chat-input-container">
            <input type="text" id="user-input" placeholder="Type your message..." onChange={e => setUserInput(e.target.value)} value={userInput}>
            </input>
            <button id="send-button" onClick={handleSendClick}>Send</button>

        </div>
    </div>
    )
}
export default ChatReact;