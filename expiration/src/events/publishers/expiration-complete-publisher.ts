import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@ticketingdev0312/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
