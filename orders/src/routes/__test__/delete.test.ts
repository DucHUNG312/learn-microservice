import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

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

it("has a route handler listing to /api/orders/:orderId for delete request", async () => {
  const { order } = await requestOrder();
  const response = await request(app).delete(`/api/orders/${order.id}`);
  expect(response.status).not.toEqual(404);
});

it("can only be access if user is signed in", async () => {
  const { order } = await requestOrder();
  await request(app).delete(`/api/orders/${order.id}`).expect(401);
});

it("return a status other than 401 if user is signed in", async () => {
  const { order, user } = await requestOrder();
  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user);

  expect(response.status).not.toEqual(401);
});

it("return a 400 if orderId is invalid", async () => {
  const { user } = await requestOrder();
  const response = await request(app)
    .delete("/api/orders/orderId")
    .set("Cookie", user);

  expect(response.status).toEqual(400);
});

it("return a 401 if one user tries to delete another user order", async () => {
  const { order } = await requestOrder();
  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin());

  expect(response.status).toEqual(401);
});

it("marks an order as cancelled", async () => {
  const { order, user } = await requestOrder();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expect to make sure everything is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const { order, user } = await requestOrder();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
