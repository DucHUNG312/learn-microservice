import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@ticketingdev0312/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const deplay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        // delay event, then after 15 minutes queue process will
        // received the event from redis
        delay: deplay, // 15 minutes
      }
    );

    msg.ack();
  }
}
