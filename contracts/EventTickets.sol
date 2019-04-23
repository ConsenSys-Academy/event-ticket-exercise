pragma solidity ^0.5.0;
 
contract EventTickets {
    address payable public owner = msg.sender;
    uint   PRICE_TICKET = 100 wei;
 
    struct Event {
        string description;
        string website;
        uint tickets;
        uint sales;
        mapping(address => uint) buyers;
        bool openSales;
    }
     
    Event myEvent;


    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
     
    constructor(string memory _desc, string memory _web, uint _tickets) public {
        myEvent.description = _desc;
        myEvent.website = _web;
        myEvent.tickets = _tickets;
        myEvent.openSales = true;
    }
     
    function readEvent() view public returns(string memory description, string memory website, uint tickets, uint sales, bool isOpen) {
        return (myEvent.description, myEvent.website, myEvent.tickets, myEvent.sales, myEvent.openSales);
    }

    function getBuyerTicketCount(address buyer) view public returns(uint count){
        return myEvent.buyers[buyer];
    }
     
    function buyTickets(uint _numTickets) public payable {
        require(myEvent.openSales == true);
        require(msg.value >= _numTickets * PRICE_TICKET);
        require(myEvent.tickets - myEvent.sales >= _numTickets);
        myEvent.buyers[msg.sender] += _numTickets;
        myEvent.sales += _numTickets;
        uint paymentChange = msg.value - _numTickets * PRICE_TICKET;
        if (paymentChange > 0) {
            address(msg.sender).transfer(paymentChange);
        }
    }
     
    function getRefund() public {
        require(myEvent.buyers[msg.sender] > 0);
        uint refundTickets = myEvent.buyers[msg.sender];
        myEvent.sales -= refundTickets;
        delete myEvent.buyers[msg.sender];
        address(msg.sender).transfer(refundTickets * PRICE_TICKET);
    }
     
    function endSale() onlyOwner public {
        myEvent.openSales = false;
        owner.transfer(address(this).balance);
    }
}