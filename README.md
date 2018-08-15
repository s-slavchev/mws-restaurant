# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 2

For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Three, you will take the connected application you yu built in Stage One and Stage Two and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using Lighthouse.

### Specification

You will be provided code for an updated Node development server and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the work of improving your Stage Two project code.

This server is different than the server from stage 2, and has added capabilities. Make sure you are using the Stage Three server as you develop your project. Connecting to this server is the same as with Stage Two, however.

You can find the documentation for the new server in the README file for the server.

Now that you’ve connected your application to an external database, it’s time to begin adding new features to your app.

### Requirements

1. Add a form to allow users to create their own reviews: In previous versions of the application, users could only read reviews from the database. You will need to add a form that adds new reviews to the database. The form should include the user’s name, the restaurant id, the user’s rating, and whatever comments they have. Submitting the form should update the server when the user is online.

2. Add functionality to defer updates until the user is connected: If the user is not online, the app should notify the user that they are not connected, and save the users' data to submit automatically when re-connected. In this case, the review should be deferred and sent to the server when connection is re-established (but the review should still be visible locally even before it gets to the server.)

3. Meet the new performance requirements: In addition to adding new features, the performance targets you met in Stage Two have tightened. Using Lighthouse, you’ll need to measure your site performance against the new targets.

* Progressive Web App score should be at 90 or better.
* Performance score should be at 90 or better.
* Accessibility score should be at 90 or better.

You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### How to run the project

1. Since the application fetches the data from a server there is a need to run one locally. Please follow these steps to run a local sailsjs application server: 
1.1  Clone [MWS Stage 3 server](https://github.com/udacity/mws-restaurant-stage-3)
1.2 Install project dependencies 
    ```bash
    npm install
    ```
   1.3 Install Sails.js globally
   ```bash
   npm install sails -g
   ```
   1.4 Start the server 
   ```bash
   node server
   ```
   1.5 Test the server with a **curl** request
   ```bash
   curl "http://localhost:1337/restaurants"
   ```
   Further information can be found on [MWS Stage 3 Server documentation page](https://github.com/udacity/mws-restaurant-stage-3)

2. To serve the project itself there is a need to use a simple web server. In a development/testing environment a simple python web server is sufficient. Please **cd** in the project directory and run the following command if you have python version 2 installed:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   For python version 3 the following command should be used:
   ```bash
   python3 -m http.server 8000
   ```
3. With your server running, visit the site here http://localhost:8000.
