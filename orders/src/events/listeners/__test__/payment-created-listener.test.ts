import mongoose from "mongoose";
import { PaymentCreatedEvent } from "@ticketingdev0312/common";
import { PaymentCreatedListener } from "../payment-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { OrderStatus } from "@ticketingdev0312/common";

const setup = async () => {
  // Create a instance of listener
  const listener = new PaymentCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 10,
  });
  await ticket.save();

  // Create and save an order
  const order = Order.build({
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket: ticket,
  });
  await order.save();

  // Create a fake data event
  const data: PaymentCreatedEvent["data"] = {
    id: "id",
    orderId: order.id,
    stripeId: "stripeId",
    userId: order.userId,
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    // mock ack()
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

it("updates the order status to complete", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  // We refetched the order again because the order in setup() has the
  // outdate status
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it("emit an OrderComplete event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.status).toEqual(OrderStatus.Complete);
  expect(eventData.orderId).toEqual(data.orderId);
  expect(eventData.userId).toEqual(data.userId);
  expect(eventData.stripeId).toEqual(data.stripeId);
});

it("ack the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
