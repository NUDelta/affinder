# affinder

An visual-programming environment for defining concepts of situations that afford activities using context-features.


## Running
Affinder depends on [`affinder-search`](https://github.com/youralien/affinder-search) to be running. Make sure [`updateYelpCategories`](https://github.com/NUDelta/affinder/blob/master/server/methods.js) is pointing to a running instance of affinder-search's search_yelp_categories_server.py

The LLM chatbot depends on ['GPT_SERVER'][https://github.com/NUDelta/GPT-server]. Make sure you set the API key in the .env file before running this. For now , you can use our key but you will need to pay for a new key. You need to make sure GPT SERVER is running when you want to use the chatbot (npm start in a different terminal window)
**IMPORTANT**
The URL of the Affinder-Search server can be set with the environment variable `AFFINDER_SEARCH_URL`. This is the running instance URL http://134.122.115.45:5000/ 



## BUGS
If you run into problems running the application, here are things that worked in the past

- reinstall meteor 
- use NVM to install a different version of Node
- delete Node Modules and run npm i 



## Folder Organization
`client/template/workspace.html`: This is the overall view, which links out to other client html/js templates (feature discovery, blockly workspace, simulating yelp business instances, chatbot)

`client/templates/ChatReact.js` contains the chatbot component , using React instead of Meteor.


`server/methods.js` has some helpful Meteor methods (think of them sorta of like API routes) that get access to database level information through internal HTTP requests. Used for the unlimited vocabulary search.
