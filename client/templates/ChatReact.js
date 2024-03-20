import React from 'react';
import { useEffect, useState } from 'react';
import {splitVarDeclarationAndRules} from "../../lib/detectors/detectors";
import { updateBlocklyWorkspace } from './blockly.js';

function ChatReact () {
   const [messages, setMessages] = useState([]);
   const [userInput, setUserInput] = useState('');
   const [displayOptions, setDisplayOptions] = useState(false);
   const [itemsList, setItemsList] = useState([]);
   

    useEffect(() => {
        // Initialize the chat box with a welcome message
        const welcomeMessage = { user: 'Assistant', message: 'Welcome to the chat! Select an option or type your query'  };
        
        setMessages([welcomeMessage]);
        setDisplayOptions(true);
      }
    , []);

    async function sendQuery(message) {
        console.log("sending query: " + message);
        const response = await fetch('http://localhost:4000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message }),
        });
        const data = await response.json();
        
        // Update the items list
        if (data.items && data.items.length > 0) {
            setItemsList(data.items);
        } else {
            // Keep the existing items if no new items are received
            console.log("No new items received, keeping existing items.");
        }
    
        // Process the response items data and update Blockly workspace
        // if (data.items && data.items.length > 0) {
        //     const blocklyFormatData = processForBlockly(data);
        //     updateBlocklyWorkspace(blocklyFormatData);
        // }
    
        const assistantMessage = {
            user: 'Assistant',
            message: data['answer logic'] && data['answer logic'].answer_logic 
                        ? data['answer logic'].answer_logic 
                        : "No answer logic found."
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        
        // only update if new items are received
        if (data.items && data.items.length > 0) {
            setItemsList(data.items);
        }
        console.log(messages);
    }
    
    // Reformant LLM data into Blockly compatible format
    function processForBlockly(data) {
        return data.items.map(item => {
            return {
                type: "text",
                fields: {
                    // TEXT: `${item.name}: ${item.description}`
                    TEXT: `${item.name}`
                }
            };
        });
    }

    function handleSendClick() {
        const userMessage = { user: 'User', message: userInput };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setUserInput('');
        sendQuery(userInput);
    }

    const addItemToWorkspace = (item, index) => {
        const blocklyFormatData = processForBlockly({ items: [item] });
        updateBlocklyWorkspace(blocklyFormatData);
        removeItemFromChat(index);
    };    

    const removeItemFromChat = (index) => {
        setItemsList(prevItems => prevItems.filter((_, idx) => idx !== index));
    };

    const askFollowUp = (itemName) => {
        setUserInput(`Explain why ${itemName} is a good suggestion`);
    };
    
    const [prompts, setprompts] = useState(["Alternative Suggestions", "Example places"])
    function handlePromptQuery(prompt) {
        console.log("prompting query");
        let code = $('#compiledBlockly').val();
        var workspacedata = splitVarDeclarationAndRules(code);
    
        if (prompt === "Evaluate and Regroup") {
            getEvaluateConcepts(workspacedata);
        } else if (prompt === "Give Suggestions") {
            getHighLevelConcepts(workspacedata);
        }
    }
   
    function getHighLevelConcepts(workspacedata) {
        let description= $('input[name=detectorname]').val()
        let highlvlconcepts = []
        workspacedata[1].forEach(rule => {
            console.log(rule)
            let highlvlconcept = rule.split("=")[0]
            console.log(highlvlconcept)
            highlvlconcepts.push(highlvlconcept)
            
        });
        let workspaceVariables = workspacedata[1].join(' ');
        console.log(highlvlconcepts);

        const query_prompt = `The user's concept expression is ${workspaceVariables}, what are alternative concepts the user has not yet explored? list 5.`;
        // sendQuery(query_prompt);
        setUserInput(query_prompt);

    }

    function getEvaluateConcepts(workspacedata) {
        let description = $('input[name=detectorname]').val();
        print("workspacedata", workspacedata);
        let workspaceVariables = workspacedata[1].join(' ');
        const query_prompt = `When asked to think about breaking down ${description} into high level categories and then places, the user ended up with this after some time ${workspaceVariables}. Evaluate and regroup what the user has. Be specific in your feedback and directions.`;
        setUserInput(query_prompt);
        // sendQuery(query_prompt);
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

            {/* Display Items as separate bubbles */}
            {itemsList.map((item, index) => (
                    <div key={index} className="item-bubble" title={item.description}>
                        {item.name}
                        {/* Buttons for actions */}
                        <button onClick={() => addItemToWorkspace(item, index)}>✔️</button>
                        <button onClick={() => removeItemFromChat(index)}>❌</button>
                        <button onClick={() => askFollowUp(item.name)}>❓</button>
                    </div>
                ))}

            {displayOptions &&
            <div id="prompt-container">
            
             {prompts.map((prompt, index) => (
                    <div key={index} className="prompt" onClick={() => handlePromptQuery(prompt)}>
                       {prompt}
                    </div>
                ))}
           
            </div>
            }
            

            
        </div>
        <div id="chat-input-container">
            <textarea
                id="user-input"
                placeholder="Type your message..."
                onChange={e => setUserInput(e.target.value)}
                value={userInput}
                rows="1" // Start with a single line
            ></textarea>
            <button id="send-button" onClick={handleSendClick}>Send</button>
        </div>

    </div>
    )
}
export default ChatReact;