import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], message: Message): void;
  // Using protected client for the child classes of this class can
  // easily access NATS client
  protected client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    // By default, our node NATS streaming library is going to turn back to the NATS server
    // and say NATS server that the event is received, but if we rely upon that behavior
    // if anything inside our message handler goes incorrect then we're never going to hear
    // about it again. So here we're using setManualAckMode(true), then after all the process
    // inside message handler is completed, after that we acknowledge and say ok to NATS server.
    // If we don't have any acknowledge about incoimg event then NATS will wait 30 seconds (by default)
    // and after that NATS will the that event and send it on to some other member of the queue group
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`RECEIVED: ${this.subject}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf-8"));
  }
}
