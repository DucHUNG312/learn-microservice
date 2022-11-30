import mongoose from "mongoose";
import { OrderCompletedListener } from "../order-completed-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCompletedEvent, OrderStatus } from "@ticketingdev0312/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCompletedListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  // Create and save a ticket
  const ticket = Ticket.build({
    title: "title",
    price: 10,
    userId: "userId",
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create fake data event
  const data: OrderCompletedEvent["data"] = {
    status: OrderStatus.Complete,
    orderId: orderId,
    userId: new mongoose.Types.ObjectId().toHexString(),
    stripeId: "stripId",
    ticketId: ticket.id,
  };

  // Create fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("update the userId of the ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticketId);

  expect(updatedTicket!.userId).toEqual(data.userId);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
