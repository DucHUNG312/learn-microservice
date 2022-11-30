import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "title",
    price: 10,
    userId: "123",
  });

  // Save the ticket to database and expect the version is 0
  await ticket.save();
  expect(ticket.version).toEqual(0);

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two seperate changes to the tickets we fetched
  firstInstance!.set({ price: 20 });
  secondInstance!.set({ price: 30 });

  // Save the first fetched ticket, version number is increased to 1 in database
  await firstInstance!.save();

  // Save the second fetched ticket and expect an error because there is no
  // version number is 0 in database
  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error("Should not reach this point!");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "title",
    price: 10,
    userId: "123",
  });

  // version is 0
  await ticket.save();
  expect(ticket.version).toEqual(0);
  // version updated to 1
  await ticket.save();
  expect(ticket.version).toEqual(1);
  // version updated to 2
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
