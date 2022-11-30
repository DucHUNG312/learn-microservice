import express, { Request, Response } from "express";
import { stripe } from "../stripe";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@ticketingdev0312/common";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Token is required!"),
    body("orderId").not().isEmpty().withMessage("orderId is required!"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Order already cancelled!");
    }

    // Create a payment with stripe
    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    // Save the payment to Payment collections
    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id,
      userId: req.currentUser!.id,
    });
    await payment.save();

    // publish payment created event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      userId: payment.userId,
    });

    res.status(201).send({ status: "success", id: payment.id });
  }
);

export { router as createChargeRouter };
