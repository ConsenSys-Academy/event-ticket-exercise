const EventTickets = artifacts.require("EventTickets");
const EventTicketsV2 = artifacts.require("EventTicketsV2");

module.exports = function(deployer) {
  deployer.deploy(EventTickets, "description", "URL", 100);
  deployer.deploy(EventTicketsV2);
};
