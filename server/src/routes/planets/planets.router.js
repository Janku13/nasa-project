const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const planetesRouter = express.Router();

planetesRouter.get("/", httpGetAllPlanets);

module.exports = planetesRouter;
