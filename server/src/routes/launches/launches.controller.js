const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
// console.log(Array.from(launches.values()));
// console.log(launches.values());

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);

  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
  // console.log(req.body.mission);
  // res.send(req.body.rocket);
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required data",
    });
  }
  //console.log("date 1", launch.launchDate);
  launch.launchDate = new Date(launch.launchDate);
  //console.log("date 2", launch.launchDate);
  //console.log("stringfy date", launch.launchDate.toString());
  if (launch.launchDate.toString() === "Invalid Date") {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  // if (isNaN(launch.launchDate)) {
  //   return res.status(400).json({
  //     error: "Invalid launch date",
  //   });
  // }
  //console.log(req.body);
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existesLaunch = await existsLaunchWithId(launchId);
  if (!existesLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }
  const aborted = await abortLaunchById(launchId);
  console.log(aborted);
  if (!aborted) {
    return res.status(400).json({
      error: "Did not abort",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
