var EventTicketsV2 = artifacts.require('EventTicketsV2')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract('EventTicketV2', function(accounts) {

    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]

    let instance

    beforeEach(async () => {
        instance = await EventTicketsV2.new()
    })

})