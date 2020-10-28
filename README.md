# affinder

## An Example Concept Expression that Affinder helps developers construct 

Desired Concept to Express: "Open space for play", maybe such as place to toss a frisbee.
Available Context Features? Place/Categories/Reviews, Weather, Time 

(Asking Convo Assistants for "Whats a nice open space for play when I visit Evanston IL", why do we need this representation for retrieval, rather than what current search engines tell us?)

Obstacle - Top Down: No available context features that detect "open space"

Intermed. Concept: Start with parks (open grassy fields)


## Running
Affinder depends on [`affinder-search`](https://github.com/youralien/affinder-search) to be running. Make sure [`updateYelpCategories`](https://github.com/NUDelta/affinder/blob/master/server/methods.js) is pointing to a running instance of affinder-search's search_yelp_categories_server.py


To connect to `ce-platform`, we run affinder by connecting to the `ce-platform` database, i.e.

```
MONGO_URL=mongodb://user:password@localhost:27017/meteor meteor
```

## Backing up database
Follow this SO post for more information on how to dump and restore with Mongo and Meteor: https://stackoverflow.com/questions/22178244/back-up-meteor-database-with-mongodump


## Folder Organization
`client/template/workspace.html`: This is the overall view, which links out to other client html/js templates (feature discovery, blockly workspace, simulating yelp business instances)

`server/methods.js` has some helpful Meteor methods (think of them sorta of like API routes) that get access to database level information through internal HTTP requests. Used for the unlimited vocabulary search.
