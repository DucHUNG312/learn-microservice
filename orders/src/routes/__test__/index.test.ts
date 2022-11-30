import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 10,
  });
  await ticket.save();

  return ticket;
};

it("has a route handler listing to /api/orders for get request", async () => {
  const response = await request(app).get("/api/orders");
  expect(response.status).not.toEqual(404);
});

it("can only be access if user is signed in", async () => {
  await request(app).get("/api/orders").expect(401);
});

it("return a status other than 401 if user is signed in", async () => {
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", global.signin());

  expect(response.status).not.toEqual(401);
});

it("fetch orders for an particular user", async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  // Create one order as user#1
  const { body: orderOfUserOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as user#2
  const { body: orderOneOfUserTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwoOfUserTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for user#1
  const responseOfUserOne = await request(app)
    .get("/api/orders")
    .set("Cookie", userOne)
    .expect(200);

  // Make request to get orders for user#2
  const responseOfUserTwo = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(responseOfUserOne.body.length).toEqual(1);
  expect(responseOfUserOne.body[0].id).toEqual(orderOfUserOne.id);
  expect(responseOfUserOne.body[0].ticket.id).toEqual(ticketOne.id);

  expect(responseOfUserTwo.body.length).toEqual(2);
  expect(responseOfUserTwo.body[0].id).toEqual(orderOneOfUserTwo.id);
  expect(responseOfUserTwo.body[1].id).toEqual(orderTwoOfUserTwo.id);
  expect(responseOfUserTwo.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(responseOfUserTwo.body[1].ticket.id).toEqual(ticketThree.id);
});
