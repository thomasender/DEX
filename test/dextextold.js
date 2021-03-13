//The user must have ETH deposited such that ETH balance is higher or equal to buy order
//User must have  enough tokens available so that tokenBalance is higher or equal the sell order amount, if you wanna sell Link for ETH you must have enough link deposited to create the limitorder
//The first order ([0]) in the BUY order book should have the highest price, decreasing in price as array grows.
//SELL order book should be sorted from lowest to highest starting with index 0
//The orderBook should handle multiple orders with the same prize correctly
//It should revert if address to createLimitOrder is address(0)
//It should increment LimitOrder ID if successful
//It should revert if token(ticker) does not exist

const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');

contract.skip("Dex", accounts => {
  it("should revert buy limitOrder if ETH balance of user is too low", async () => {
    let dex = await Dex.deployed()
    let link = await Link.deployed()
    await link.approve(dex.address, 500);
    await truffleAssert.passes(
      dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
    )
    await truffleAssert.reverts(
      dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
    )
    dex.deposit(1000, web3.utils.fromUtf8("LINK"))

    await truffleAssert.passes(
      dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
    )
  })
  it("should allow buy limitOrder if ETH balance of user is higher or equal to order(amount * price)", async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();
    await link.approve(dex.address, 500);



  })
  it("should revert sell limitOrder if token balance of user is too low", async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();
    await link.approve(dex.address, 500);
    await dex.deposit(100, web3.utils.fromUtf8("LINK"));

    await truffleAssert.reverts(
      dex.createLimitOrder(web3.utils.fromUtf8("LINK"), 10, web3.utils.toWei("1", "ether"))
    )
  })
/*  it("should revert if address to createLimitOrder is address(0)", async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();
    await link.approve(dex.address, 500);
    await dex.deposit(100, web3.utils.fromUtf8("LINK"));
    await.truffle.reverts(
      dex.createLimitOrder(web3.utils.fromUtf8("LINK"), 10, web3.utils.toWei("1", "ether"), {from: address(0)})
    )
  })
  it("It should increment LimitOrder ID if successful", async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();
    await link.approve(dex.address, 500);
    await dex.deposit(100, web3.utils.fromUtf8("LINK"));
  })
  it("It should revert if token(ticker) does not exist", async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();
    await link.approve(dex.address, 500);
    await dex.deposit(100, web3.utils.fromUtf8("LINK"));
    await dex.createLimitOrder(web3.utils.fromUtf8("ADA"), 10, web3.utils.toWei("1", "ether"), {from: address(0)})
  })
*/

})
