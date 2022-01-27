const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

//const habitablePlanet = [];

function isHabitablePlanet(planetData) {
  return (
    planetData["koi_disposition"] === "CONFIRMED" &&
    planetData["koi_insol"] > 0.36 &&
    planetData["koi_insol"] < 1.11 &&
    planetData["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true, //each row hand a js object
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanet.push(data);
          savePlanet(data);
        }
      })

      .on("err", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log("The number of planets is : ", countPlanetsFound);
        resolve();
      });
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name, //checando nomes igual planet.kepler_name
      },
      {
        keplerName: planet.kepler_name, // se não existe é inserido esse argumento
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error("Could not add planet data");
  }
}

async function getAllPlanets() {
  const data = await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
  //console.log(data);
  return data;
}
// function getAllPlanets() {
//   console.log(habitablePlanet);
//   return habitablePlanet;
// }

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
