export const stripe = {
  charges: {
    // a mock return a promise that resolve an object with an id to use in test stripeId
    create: jest.fn().mockResolvedValue({
      id: "id",
    }),
  },
};
