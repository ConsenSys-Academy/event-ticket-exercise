# Event Ticket Exercise

## Event Ticket Requirements:

- Create a smart contract where users can buy Tickets at 1 ETH per ticket.
- The owner creates the event by setting the # of tickets, description and URL.
- The event can be viewed to confirm the details set.
- Tickets can be purchased by indicate the quantity of tickets with the amount of ether they pay the contract.
- Include the ability to refund the buyer.
- Include the ability for the owner to end the sale and withdraw the entire balance.


## High Level Steps:
- Create 2 variables: owner and price. Set the price as a constant of 1 ether.
- Create a struct with the following: description, website, tickets, sales, buyers as mapping, openSales as boolean.
- Create a constructor and a modifier
- Create functions: readEvent(), buyTickets(), getRefund(), endSale().

## Steps:

- Create contract structure
- Create state variables
- Use a constructor to define the description, the URL, the ticketsAvailable and set openSales to true.
- Create a readEvent function that returns the description, the URL, tickets, sales and openSales.
- Create a buyTicket function that checks that openSales is true, the amount sent is greater or equal to the number of tickets x price of the tickets and that the tickets are in stock. 
  - allocate the number of tickets to the buyer
  - add the number of tickets to the total sales
  - calculate if any payment change is required and if so, send the change back to the sender
- Create a getRefund function by:
  - checking the purchaser is valid
  - get the number of tickets purchased
  - subtract this from the total stock
  - remove the buyer from the event mapping
  - transfer the funds back to the sender/purchaser
- Create an endSale function that when called, will transfer the remaining contract balance to the owner and also set openSales to false.