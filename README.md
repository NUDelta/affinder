# affinder

## Running
Affinder depends on [`affinder-search`](https://github.com/youralien/affinder-search) to be running. Make sure [`updateYelpCategories`](https://github.com/NUDelta/affinder/blob/master/server/methods.js) is pointing to a running instance of affinder-search's search_yelp_categories_server.py


To connect to `ce-platform`, we run affinder by connecting to the `ce-platform` database, i.e.

```
MONGO_URL=mongodb://user:password@localhost:27017/meteor meteor
```

## Backing up database
Follow this SO post for more information on how to dump and restore with Mongo and Meteor: https://stackoverflow.com/questions/22178244/back-up-meteor-database-with-mongodump

