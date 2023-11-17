# To Do file for Affinder and gpt-server

## Quick and Important
1. Move the chat to better location
2. Improve chat and item bubble design
3. Improve item description functionality
4. Add the 'Instructions' panel so the user doesn't get lost


## Medium and Important
1. Items do not disappear after additional queries are made. Disappear iff the item has been accepted or deleted
    - maybe create another chat for additional, followup queries? I.e. the main queries and items are in the main chat. The "elaborate on this" queries are in the other. This creates an easier structure for the user to follow, no back and forth.
2. When item is accepted, appropriate block type is created in the workspace (category, place, etc). Right now it's simple text box.
3. Create an example workspace state for easy testing and initialization
4. Improve the 'Give suggestions' functionality
    - how are complex workspace states handled?
    - what should be the exact query? 
    - when do we ask for high level categories, lower level categories?
5. Implement the "Help me think about the concept better" functionality
    - should suggest different ways to go about it
    - should only be available in the beginning (?)

## Quick and Not Important
1. Improve design of specific parts of the workspace, delete/hide unnecessary parts

## Medium and Not Important
1. Update ReadMe.md
