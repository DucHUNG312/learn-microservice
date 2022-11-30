import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from "@ticketingdev0312/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
