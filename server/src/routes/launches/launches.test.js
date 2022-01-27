const request = require("supertest");
const app = require("../../app");
const {
  mongoConnect,
  mongoDisconnect,
} = require("../../services/mongo.conection");

describe("Launch API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Teste Get /launches", () => {
    test("Should respond with 200 success", async () => {
      const response = await request(app)
        .get("/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    const launchData = {
      mission: "GO GO",
      rocket: "rocket",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };
    const launchDataWithoutDate = {
      mission: "GO GO",
      rocket: "rocket",
      target: "Kepler-62 f",
    };
    const launchDataWithInvalidDate = {
      mission: "GO GO",
      rocket: "rocket",
      target: "Kepler-62 f",
      launchDate: "Jaanan",
    };
    test("It should respond with 201", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(launchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing data", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing required data",
      });
    });
    test("It should catch invalid data", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
