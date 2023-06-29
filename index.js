const express = require("express");
const app = express();
const userRoutes = require('./src/routes/user.router');
const loginRoutes = require('./src/routes/login.router');

const port = process.env.PORT || 3000;

//enable app to parse json
app.use(express.json());

//Auth routes
app.use('/api/user', userRoutes);
app.use('/api/login', loginRoutes);

//when there is an invalid request
app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        result: "Endpoint not found.",
    });

    //end response process
    res.end();
});
//error handler
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});
//make server listen to given port
app.listen(port, () => {
    console.log("Server running at " + port);
});

//export app for testing
module.exports = app;