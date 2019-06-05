// The public file for automated testing can be found here: https://gist.github.com/ConsenSys-Academy/e9ec0d8d6c53b56ca9673cfa139b5644

var EventTickets = artifacts.require('EventTickets')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('EventTicket', function(accounts) {

    const firstAccount = accounts[0]
    const secondAccount = accounts[1]
    const thirdAccount = accounts[2]

    const description = "description"
    const url = "URL"
    const ticketNumber = 100

    const ticketPrice = 100

    let instance

    beforeEach(async () => {
        instance = await EventTickets.new(description, url, ticketNumber)
    })

    describe("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, firstAccount, "the deploying address should be the owner")
        })

        it("sales should be open when the contract is created", async() => {
            const instance = await EventTickets.new(description, url, ticketNumber)
            const eventDetails = await instance.readEvent()
            
            assert.equal(eventDetails.isOpen, true, "the event should be open")
        })
    })

    describe("Functions", () => {

        it("readEvent() should return myEvent details", async() => {
            const event = await instance.readEvent()
    
            assert.equal(event.description, description, "the event descriptions should match")
            assert.equal(event.website, url, "the event urls should match")
            assert.equal(event.totalTickets, ticketNumber, "the number of tickets for sale should be set")
            assert.equal(event.sales, 0, "the ticket sales should be 0")
        })

        describe("buyTickets()", async () => {

            it("tickets should be able to be purchased when the event is open", async() => {
                await instance.buyTickets(1, {from: secondAccount, value: ticketPrice})
                const eventDetails = await instance.readEvent()
        
                assert.equal(eventDetails.sales, 1, "the ticket sales should be 1")
            })

            it("tickets should only be able to be purchased when the msg.value is greater than or equal to the ticket cost", async() => {
                await catchRevert(instance.buyTickets(1, {from: secondAccount, value: ticketPrice - 1}))
            })

            it("tickets should only be able to be purchased when there are enough remaining", async() => {
                await instance.buyTickets(50, {from: secondAccount, value: ticketPrice * 50})
                await catchRevert(instance.buyTickets(51, {from: thirdAccount, value: ticketPrice * 51}))   
            })

            it("the buyers account should be credited with tickets when they make a purchase", async() => {
                await instance.buyTickets(2, {from: secondAccount, value: ticketPrice * 2})
                const count = await instance.getBuyerTicketCount(secondAccount)
        
                assert.equal(count, 2, "the buyer should have 2 tickets in their account")
            })

            it("the number of ticket sales should increment appropriately when tickets are sold", async() => {
                await instance.buyTickets(2, {from: secondAccount, value: ticketPrice * 2})
                const eventDetails = await instance.readEvent()
                const sales = eventDetails.sales
        
                assert.equal(sales, 2, "the event should have 2 sales recorded")
            })

            it("buyers should be refunded any surplus funds sent with the transaction", async() => {
                const paymentAmount = ticketPrice * 5

                const preSaleAmount = await web3.eth.getBalance(secondAccount)
                const buyReceipt = await instance.buyTickets(1, {from: secondAccount, value: paymentAmount})
                const postSaleAmount = await web3.eth.getBalance(secondAccount)
                
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx)
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed

                assert.equal(postSaleAmount, (new BN(preSaleAmount).sub(new BN(ticketPrice)).sub(new BN(buyTxCost))).toString(), "overpayment should be refunded")
            })
        })  
        
        describe("getRefund()", async() => {

            it("buyers should be refunded the appropriate value amount when submitting a refund", async() => {
                const preSaleAmount = await web3.eth.getBalance(secondAccount)
                const buyReceipt = await instance.buyTickets(1, {from: secondAccount, value: ticketPrice})
                const refundReceipt = await instance.getRefund({from: secondAccount})
                const postSaleAmount = await web3.eth.getBalance(secondAccount) 
                
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx)
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed

                const refundTx = await web3.eth.getTransaction(refundReceipt.tx)
                let refundTxCost = Number(refundTx.gasPrice) * refundReceipt.receipt.gasUsed

                assert.equal(postSaleAmount, (new BN(preSaleAmount).sub(new BN(buyTxCost)).sub(new BN(refundTxCost))).toString(), "buyer should be fully refunded when calling getRefund()")        
            })
        })

        describe("endSale()", async() => {

            it("the event owner should be able to close ticket sales", async() => {
                await instance.endSale({from: firstAccount})
                const eventDetails = await instance.readEvent()

                assert.equal(eventDetails.isOpen, false, "ticket sales should be closed when the owner calls endSale()")
            })

            it("addresses other than the owner should not be able to close the event", async() => {
                await catchRevert(instance.endSale({from: secondAccount}))
            })

            it("tickets should be able to be purchased when the event is not open", async() => {
                await instance.endSale({from: firstAccount})
                await catchRevert(instance.buyTickets(1, {from: secondAccount, value: ticketPrice}))
            })

            it("the contract balance should be transferred to the owner when the event is closed", async() => {
                const numberOfTickets = 1
                
                const preSaleAmount = await web3.eth.getBalance(firstAccount)
                const buyReceipt = await instance.buyTickets(numberOfTickets, {from: secondAccount, value: numberOfTickets * ticketPrice})
                const endSaleReceipt = await instance.endSale({from: firstAccount})
                const postSaleAmount = await web3.eth.getBalance(firstAccount)
                
                const endSaleTx = await web3.eth.getTransaction(endSaleReceipt.tx)
                let endSaleTxCost = Number(endSaleTx.gasPrice) * endSaleReceipt.receipt.gasUsed

                assert.equal(postSaleAmount, (new BN(preSaleAmount).add(new BN(numberOfTickets).mul(new BN(ticketPrice))).sub(new BN(endSaleTxCost))).toString(), "contract owner should receive contract balance when closing the event")
            })
        })
    })
})


