# Event Ticket Exercise

This directory is a [truffle project](https://truffleframework.com/docs/truffle/overview) that contains the required contract, migration and test files. In this exercise you are going to implement the EventTickets.sol and EventTicketsV2.sol contracts.

The contract files contain a framework and comments to help you implement the contract. We have written a set of tests (in javascript) to determine if you implement the contract correctly. As an additional challenge, [try writing some Solidity tests](https://truffleframework.com/docs/truffle/testing/writing-tests-in-solidity) in TestEventTicket.sol.

To get started, clone this repo.

This project is configured to connect to a development blockchain running on localhost port 8545. This is the default configuration for [Ganache CLI.](https://github.com/trufflesuite/ganache-cli)

You can test your contract by running your development blockchain and then `truffle test` in the terminal.

If your tests do not pass, modify the contract, recompile, redeploy and retest. Iterate until all of the tests pass.

## Event Ticket Requirements:

- The owner creates the event by setting the # of tickets, description and URL.
- The event can be viewed to confirm the details set.
- Tickets can be purchased by indicate the quantity of tickets with the amount of ether they pay the contract.
- Include the ability to refund the buyer.
- Include the ability for the owner to end the sale and withdraw the entire balance.


## High Level Steps:
- Create a struct with the following: description, website, tickets, sales, buyers as mapping, isOpen as boolean.
- Create a constructor and a modifier
- Create functions: readEvent(), buyTickets(), getRefund(), endSale().

## Steps:

- Create contract structure
- Create state variables
- Use a constructor to define the description, the URL, the ticketsAvailable and set isOpen to true.
- Create a readEvent function that returns the description, the URL, tickets, sales and isOpen.
- Create a buyTicket function that checks that isOpen is true, the amount sent is greater or equal to the number of tickets x price of the tickets and that the tickets are in stock. 
  - allocate the number of tickets to the buyer
  - add the number of tickets to the total sales
  - calculate if any payment change is required and if so, send the change back to the sender
- Create a getRefund function by:
  - checking the purchaser is valid
  - get the number of tickets purchased
  - subtract this from the total stock
  - remove the buyer from the event mapping
  - transfer the funds back to the sender/purchaser
- Create an endSale function that when called, will transfer the remaining contract balance to the owner and also set isOpen to false.
