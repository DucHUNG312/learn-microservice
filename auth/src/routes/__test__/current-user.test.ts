import request from "supertest";
import { app } from "../../app";

it("reponds with details about the current user", async () => {
  const cookie = await global.signup();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("throw an error if not authenicated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(401);

  // { errors: [ { message: 'Not authorized!' } ] }
  expect(response.body.errors[0].message).toEqual("Not authorized!");
});
