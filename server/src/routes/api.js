const express = require("express");

const planetesRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

const api = express.Router();

api.use("/planets", planetesRouter);
api.use("/launches", launchesRouter);

module.exports = api;
