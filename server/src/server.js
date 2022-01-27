const http = require("http");

require("dotenv").config();

const app = require("./app");
const { mongoConnect } = require("./services/mongo.conection");
const PORT = process.env.PORT || 8000;
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log("Server is On");
  });
}

startServer();
