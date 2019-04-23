pragma solidity ^0.5.0;
 
contract EventTicketsV2 {
    address payable owner = msg.sender;
    uint   PRICE_TICKET = 1 ether;
    uint idGenerator;
     
    struct Event {
        string description;
        string website;
        uint tickets;
        uint sales;
        mapping(address => uint) buyers;
        bool openSales;
    }
     
    mapping(uint => Event) events;
     
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
     
    function addEvent(string memory _desc, string memory _web, uint _tickets) onlyOwner public returns(uint) {
        Event memory newEvent;
        newEvent.description = _desc;
        newEvent.website = _web;
        newEvent.tickets = _tickets;
        newEvent.openSales = true;
        uint newEventId = idGenerator;
        events[idGenerator] = newEvent;
        ++idGenerator;
        return newEventId;
    }
     
    function readEvent(uint _id) view public returns(string memory, string memory, uint, uint, bool) {
        return (events[_id].description, events[_id].website, events[_id].tickets, events[_id].sales, events[_id].openSales);
    }
     
    function buyTickets(uint _id, uint _numTickets) public payable {
        require(events[_id].openSales == true);
        require(msg.value >= _numTickets * PRICE_TICKET);
        require(events[_id].tickets - events[_id].sales >= _numTickets);
        events[_id].buyers[msg.sender] += _numTickets;
        events[_id].sales += _numTickets;
        uint paymentChange = msg.value - _numTickets * PRICE_TICKET;
        if (paymentChange > 0) {
            address(msg.sender).transfer(paymentChange);
        }
    }
     
    function getRefund(uint _id) public {
        require(events[_id].buyers[msg.sender] > 0);
        uint refundTickets = events[_id].buyers[msg.sender];
        events[_id].sales -= refundTickets;
        delete events[_id].buyers[msg.sender];
        address(msg.sender).transfer(refundTickets * PRICE_TICKET);
    }
     
    function getBuyerNumberTickets(uint _id) public view returns(uint) {
        return events[_id].buyers[msg.sender];
    }
     
    function endSale(uint _id) onlyOwner public {
        events[_id].openSales = false;
        owner.transfer(events[_id].sales * 1 ether);
    }
}