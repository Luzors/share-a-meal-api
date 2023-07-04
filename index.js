const express = require("express");
const app = express();
const userRoutes = require('./src/routes/user.router');
const loginRoutes = require('./src/routes/login.router');
const mealRoutes = require('./src/routes/meal.router');

const port = process.env.PORT || 3000;

//enable app to parse json
app.use(express.json());

//when there is an invalid request
app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        result: "Endpoint not found.",
    });

    //end response process
    res.end();
});

// Info endpoints
app.get('/api/info', (req, res) => {
    logger.info('Get server information');
    res.status(201).json({
      status: 201,
      message: 'Server info-endpoint',
      data: {
        studentName: 'Jorn',
        studentNumber: 2182902,
        description: 'Dit is de share-a-meal API van Jorn van Bommel.'
      }
    });
  });

//error handler
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

//Routes
app.use('/api/user', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/meal', mealRoutes);

//make server listen to given port
app.listen(port, () => {
    console.log("Server running at " + port);
});

//export app for testing
module.exports = app;