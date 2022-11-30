import { Order, OrderStatus } from "../order";
import { Ticket } from "../ticket";
import mongoose from "mongoose";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 10,
  });
  await ticket.save();

  // Create an instance of a order
  const order = Order.build({
    ticket: ticket,
    userId: "userid",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  // Save the order to database and expect the version is 0
  await order.save();
  expect(order.version).toEqual(0);

  // Fetch the order twice
  const firstInstance = await Order.findById(order.id);
  const secondInstance = await Order.findById(order.id);

  // Make two seperate changes to the orders we fetched
  firstInstance!.set({ price: 20 });
  secondInstance!.set({ price: 30 });

  // Save the first fetched order, version number is increased to 1 in database
  await firstInstance!.save();

  // Save the second fetched order and expect an error because there is no
  // version number is 0 in database
  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error("Should not reach this point!");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    ticket: ticket,
    userId: "userid",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  // version is 0
  await order.save();
  expect(order.version).toEqual(0);
  // version updated to 1
  await order.save();
  expect(order.version).toEqual(1);
  // version updated to 2
  await order.save();
  expect(order.version).toEqual(2);
});
