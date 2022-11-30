import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@ticketingdev0312/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
