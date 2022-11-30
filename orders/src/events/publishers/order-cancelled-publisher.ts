import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@ticketingdev0312/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
