#YT clone Backend leanings

Learning backend 

# we are doing this in node js 
1) # npm init    
✅ What npm init does

Creates a package.json file
This file stores:

Project name, version, description

Entry point file (like index.js)

Scripts (like "start": "node index.js")

Dependencies (later when installed via npm install)

License, author info, etc.

Initializes your folder as an npm-managed project
After this, npm will track dependencies and scripts inside that directory.

2) After npm init, when you install something like:
# npm install express

Then:

node_modules folder is created

package-lock.json is generated/updated

Dependencies are added to package.json

Note: we have to make .gitignore ourselves 

3) # install nodemon 

4) # connect database:
     for that make a connectDB function in db/index.js  ... do this using mongoose 
     connect databse in src/index.js 

5) # make app using express in app.js

6) # make async_handler, ApiResponse, ApiError   in utils folder  so that we can reuse them

7) # then we are ready to make our models 

bcrypt helps you to hash passwords
jwt helps in tokens

8) # Upload files using multer and cloudinary