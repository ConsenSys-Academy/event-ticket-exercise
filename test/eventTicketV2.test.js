var EventTicketsV2 = artifacts.require('EventTicketsV2')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('EventTicketV2', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]

    const ticketPrice = 100

    let instance

    const event1 = {
        description: "event 1 description",
        website: "URL 1",
        ticketsAvailable: 100
    }

    const event2 = {
        description: "event 2 description",
        website: "URL 2",
        ticketsAvailable: 200
    }

    const event3 = {
        description: "event 3 description",
        website: "URL 3",
        ticketsAvailable: 300
    }

    beforeEach(async () => {
        instance = await EventTicketsV2.new()
    })

    describe("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, deployAccount, "the deploying address should be the owner")
        })
    })

    describe("Functions", () => {
        describe("addEvent()", async() =>{
            it("only the owner should be able to add an event", async() => {
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await catchRevert(instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: firstAccount}))
            })

            it("adding an event should emit an event with the provided event details", async() => {
                const tx = await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                const eventData = tx.logs[0].args

                assert.equal(eventData.desc, event1.description, "the added event descriptions should match")
                assert.equal(eventData.url, event1.website, "the added event Urls should match")
                assert.equal(eventData.ticketsAvailable.toString(10), event1.ticketsAvailable.toString(10), "the added event ticket amounts should match")
            })
        })

        describe("readEvent()", async() =>{
            it("providing the event Id should return the correct event details", async() => {
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                const eventDetails = await instance.readEvent(0)

                assert.equal(eventDetails['0'], event1.description, "the event descriptions should match")
                assert.equal(eventDetails['1'], event1.website, "the website details should match")
                assert.equal(eventDetails['2'].toString(10), event1.ticketsAvailable.toString(10), "the same number of tickets should be available")
                assert.equal(eventDetails['3'], 0, "the ticket sales should be 0")
                assert.equal(eventDetails['4'], true, "the event should be open")

            })
        })

        describe("buyTickets()", async() =>{
            it("tickets should only be able to be purchased when the event is open", async() => {
                const numberOfTickets = 1
                
                // event w/ id 1 does not exist, therefore not open
                await catchRevert(instance.buyTickets(1, numberOfTickets, {from: firstAccount, value: ticketPrice}))
            
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numberOfTickets, {from: firstAccount, value: ticketPrice})
                
                const eventDetails = await instance.readEvent(0)
                assert.equal(eventDetails['3'], numberOfTickets, `the ticket sales should be ${numberOfTickets}`)
            })

            it("tickets should only be able to be purchased when enough value is sent with the transaction", async() => {
                const numberOfTickets = 1
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await catchRevert(instance.buyTickets(0, numberOfTickets, {from: firstAccount, value: ticketPrice - 1}))
            })

            it("tickets should only be able to be purchased when there are enough tickets remaining", async() => {
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, 51, {from: firstAccount, value: ticketPrice * 51})
                await catchRevert(instance.buyTickets(0, 51, {from: secondAccount, value: ticketPrice * 51}))
            })

            it("a LogBuyTickets() event with the correct details should be emitted when tickets are purchased", async() => {
                const numTickets = 1
                
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                const tx = await instance.buyTickets(0, numTickets, {from: firstAccount, value: ticketPrice * numTickets})                
                const eventData = tx.logs[0].args

                assert.equal(eventData.buyer, firstAccount, "the buyer account should be the msg.sender" )
                assert.equal(eventData.eventId, 0, "the event should have the correct eventId")
                assert.equal(eventData.numTickets, numTickets, "the event should have the correct number of tickets purchased")
            })
        })

        describe("getRefund()", async() =>{
            it("only accounts that have purchased tickets should be able to get a refund", async() => {
                const numTickets = 1
                
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numTickets, {from: firstAccount, value: ticketPrice * numTickets}) 

                await catchRevert(instance.getRefund(0, {from: secondAccount}))
                const tx = await instance.getRefund(0, {from: firstAccount})
                const eventData = tx.logs[0]

                assert.equal(eventData.event, "LogGetRefund", "the event should be called LogGetRefund")
                assert.equal(eventData.args.accountRefunded, firstAccount, "the firstAccount should be the 'accountRefunded'")
            })

            it("account requesting a refund should be credited the appropriate amount", async() => {
                const preSaleAmount = await web3.eth.getBalance(secondAccount)
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                const buyReceipt = await instance.buyTickets(0, 1, {from: secondAccount, value: ticketPrice})
                const refundReceipt =await instance.getRefund(0, {from: secondAccount})
                const postSaleAmount = await web3.eth.getBalance(secondAccount) 
                
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx)
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed

                const refundTx = await web3.eth.getTransaction(refundReceipt.tx)
                let refundTxCost = Number(refundTx.gasPrice) * refundReceipt.receipt.gasUsed

                assert.equal(postSaleAmount, (new BN(preSaleAmount).sub(new BN(buyTxCost)).sub(new BN(refundTxCost))).toString(), "buyer should be fully refunded when calling getRefund()")             
            })
        })

        describe("getBuyerNumberTickets()", async() =>{
            it("providing an event id to getBuyerNumberTickets() should tell an account how many tickets they have purchased", async() => {
                const numberToPurchase = 3

                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numberToPurchase, {from: secondAccount, value: ticketPrice*numberToPurchase})
                let result = await instance.getBuyerNumberTickets(0, {from: secondAccount})

                assert.equal(result, numberToPurchase, "getBuyerNumberTickets() should return the number of tickets the msg.sender has purchased.")
            })
        })

        describe("endSale()", async() => {
            it("only the owner should be able to end the sale and mark it as closed", async() => {
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await catchRevert(instance.endSale(0, {from: firstAccount}))
                const txResult = await instance.endSale(0, {from: deployAccount})
                const eventData = await instance.readEvent(0)

                assert.equal(eventData['4'], false, "The event isOpen variable should be marked false.")
            })

            it("endSale() should emit an event with information about how much ETH was sent to the contract owner", async() => {
                const numberToPurchase = 3

                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numberToPurchase, {from: secondAccount, value: ticketPrice*numberToPurchase})
                const txResult = await instance.endSale(0, {from: deployAccount})
                
                const amount = txResult.logs[0].args['1'].toString()

                assert.equal(amount, ticketPrice*numberToPurchase, "the first emitted event should contain the tranferred amount as the second parameter")
            })
        })
    })
})
