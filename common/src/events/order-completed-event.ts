import { Subjects } from "./subjects";
import { OrderStatus } from "./types/order-status";

export interface OrderCompletedEvent {
  subject: Subjects.OrderCompleted;
  data: {
    status: OrderStatus;
    orderId: string;
    userId: string;
    stripeId: string;
    ticketId: string;
  };
}
