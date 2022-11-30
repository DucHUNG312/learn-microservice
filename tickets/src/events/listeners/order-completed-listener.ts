import {
  Listener,
  OrderCompletedEvent,
  Subjects,
} from "@ticketingdev0312/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
  readonly subject = Subjects.OrderCompleted;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCompletedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found!");
    }

    // change the userId when order is completed
    ticket.set({ userId: data.userId });
    await ticket.save();

    msg.ack();
  }
}
