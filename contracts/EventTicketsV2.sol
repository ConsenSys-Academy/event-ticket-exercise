pragma solidity ^0.5.0;
 
contract EventTicketsV2 {
    address payable public owner = msg.sender;
    uint   PRICE_TICKET = 100 wei;
    uint public idGenerator;
     
    struct Event {
        string description;
        string website;
        uint tickets;
        uint sales;
        mapping(address => uint) buyers;
        bool isOpen;
    }
     
    mapping(uint => Event) events;

    event LogEventAdded(string desc, string url, uint ticketsAvailable, uint eventId);
    event LogBuyTickets(address buyer, uint eventId, uint numTickets);
    event LogGetRefund(address accountRefunded, uint eventId, uint numTickets);
    event LogEndSale(address owner, uint balance);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
     
    function addEvent(string memory _desc, string memory _web, uint _tickets) onlyOwner public returns(uint) {
        Event memory newEvent;
        newEvent.description = _desc;
        newEvent.website = _web;
        newEvent.tickets = _tickets;
        newEvent.isOpen = true;
        uint newEventId = idGenerator;
        events[idGenerator] = newEvent;
        ++idGenerator;
        emit LogEventAdded(_desc, _web, _tickets, newEventId);
        return newEventId;
    }
     
    function readEvent(uint _id) view public returns(string memory, string memory, uint, uint, bool) {
        return (events[_id].description, events[_id].website, events[_id].tickets, events[_id].sales, events[_id].isOpen);
    }
     
    function buyTickets(uint _id, uint _numTickets) public payable {
        require(events[_id].isOpen == true);
        require(msg.value >= _numTickets * PRICE_TICKET);
        require(events[_id].tickets - events[_id].sales >= _numTickets);
        events[_id].buyers[msg.sender] += _numTickets;
        events[_id].sales += _numTickets;
        uint paymentChange = msg.value - _numTickets * PRICE_TICKET;
        if (paymentChange > 0) {
            address(msg.sender).transfer(paymentChange);
        }
        emit LogBuyTickets(msg.sender, _id, _numTickets);
    }
     
    function getRefund(uint _id) public {
        require(events[_id].buyers[msg.sender] > 0);
        uint refundTickets = events[_id].buyers[msg.sender];
        events[_id].sales -= refundTickets;
        delete events[_id].buyers[msg.sender];
        address(msg.sender).transfer(refundTickets * PRICE_TICKET);
        emit LogGetRefund(msg.sender, _id, refundTickets);
    }
     
    function getBuyerNumberTickets(uint _id) public view returns(uint) {
        return events[_id].buyers[msg.sender];
    }
     
    function endSale(uint _id) onlyOwner public {
        events[_id].isOpen = false;
        uint balance = events[_id].sales * PRICE_TICKET;
        owner.transfer(balance);
        emit LogEndSale(owner, balance);
    }
}