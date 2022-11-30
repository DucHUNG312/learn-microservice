import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@ticketingdev0312/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCompletedPublisher } from "../publishers/order-completed-publisher";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found!");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // publish OrderCompleted event
    await new OrderCompletedPublisher(this.client).publish({
      status: OrderStatus.Complete,
      orderId: data.orderId,
      userId: data.userId,
      stripeId: data.stripeId,
      ticketId: order.ticket.id,
    });

    msg.ack();
  }
}
