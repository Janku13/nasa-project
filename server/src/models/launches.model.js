const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

//const launches = new Map();
const DEFAULT_FLIGHT_NUMBER = 100;

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100, //flight_number
  mission: "Kepler Exploration", //name
  rocket: "Explorer IS1", //rocket.name
  launchDate: new Date("December 27, 2030"), //date_local
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};
// saveLaunch(launch);
// launches.set(launch.flightNumber, launch);
async function findLaunch(filter) {
  return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}
// function existsLaunchWithId(launchId) {
//   return launches.has(launchId);
// }

// function getAllLaunches() {
//   return Array.from(launches.values());
// }
async function getLatestFlightNumber() {
  const latesLaunch = await launchesDB.findOne().sort("-flightNumber");
  if (!latesLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latesLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDB
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       customer: ["ZTM", "NASA"],
//       upcoming: true,
//       success: true,
//     })
//   );
// }

async function saveLaunch(launch) {
  await launchesDB.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}
// function abortLaunchById(launchId) {
//   const aborted = launches.get(launchId);
//   aborted.upcoming = false;
//   aborted.success = false;
//   return aborted;
// }

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("loading data");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("fetching erro spacex");
  }
  //console.log(response.data.docs);
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };
    console.log(launch.flightNumber, launch.mission);
    saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  } else {
    await populateLaunches();
  }
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchData,
};
