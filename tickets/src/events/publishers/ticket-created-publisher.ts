import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@ticketingdev0312/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
