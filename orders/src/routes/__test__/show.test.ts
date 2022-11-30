import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const requestOrder = async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 10,
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id });
  return { order, user };
};

it("has a route handler listing to /api/orders/:orderId for get request", async () => {
  const { order } = await requestOrder();
  const response = await request(app).get(`/api/orders/${order.id}`);
  expect(response.status).not.toEqual(404);
});

it("can only be access if user is signed in", async () => {
  const { order } = await requestOrder();
  await request(app).get(`/api/orders/${order.id}`).expect(401);
});

it("return a status other than 401 if user is signed in", async () => {
  const { order, user } = await requestOrder();
  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user);

  expect(response.status).not.toEqual(401);
});

it("return a 400 if orderId is invalid", async () => {
  const { user } = await requestOrder();
  const response = await request(app)
    .get("/api/orders/orderId")
    .set("Cookie", user);

  expect(response.status).toEqual(400);
});

it("return a 401 if one user tries to fetch another user order", async () => {
  const { order } = await requestOrder();
  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin());

  expect(response.status).toEqual(401);
});

it("fetches the order", async () => {
  const { order, user } = await requestOrder();

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});
