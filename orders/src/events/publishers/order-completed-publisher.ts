import {
  Publisher,
  OrderCompletedEvent,
  Subjects,
} from "@ticketingdev0312/common";

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
  readonly subject = Subjects.OrderCompleted;
}
