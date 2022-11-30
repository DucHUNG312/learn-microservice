import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@ticketingdev0312/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create a new order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "userId",
    version: 0,
  });
  await order.save();

  // create fake data event object
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    status: OrderStatus.Cancelled,
    ticket: {
      id: "id",
    },
  };

  // mock Message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data, order };
};

it("updates the status of the order", async () => {
  const { listener, msg, data, order } = await setup();

  await listener.onMessage(data, msg);

  // refetch the order
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(updatedOrder!.status).toEqual(data.status);
});

it("acks the message", async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
