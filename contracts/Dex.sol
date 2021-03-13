pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet{

  using SafeMath for uint256;

    enum Side{
      BUY,
      SELL
    }

  struct Order{
    uint id;
    address trader;
    Side side;
    bytes32 ticker;
    uint amount;
    uint price;
  }

  uint public nextOrderId = 0;

  mapping (bytes32 => mapping (uint => Order[])) public orderBook;

  function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
      return orderBook[ticker][uint(side)];
  }


  function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public {

      if(side == Side.BUY)
      {
        require(balances[msg.sender]["ETH"] >= amount.mul(price), "Insufficient funds to create this order!");
      }
      else if(side == Side.SELL)
      {
        require(balances[msg.sender][ticker] >= amount, "Insufficient token amount!");
      }

      //To store orders, will have [Order1, Order2, ...] each order will be either a buy or sell order
      Order[] storage orders = orderBook[ticker][uint(side)];  //side is an enum and has to be converted to uint before using in a reference for a mapping!!
      //pushing the new order into the orders array, that is pointing to orderBook!!! strange, complicated but efficient
      orders.push(
        Order(nextOrderId, msg.sender, side, ticker, amount, price)
      );

      //Bubble sort for BUY orderBook, GOAL: have highest price at index 0, then price declining

      uint i = orders.length > 0 ? orders.length - 1 : 0;  //If orders.length is bigger 0 then i = oders.length - 1, else i = 0;  Shorted if statement!! Crazy stuff, haha, so cryptic!!

        if(side == Side.BUY){
            while(i > 0){
                if(orders[i - 1].price > orders[i].price) {
                    break;
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        else if(side == Side.SELL){
            while(i > 0){
                if(orders[i - 1].price < orders[i].price) {
                    break;
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }

          nextOrderId++;
}







  function depositEth() payable external {
       balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].add(msg.value);
   }

   function withdrawEth(uint amount) external {
       require(balances[msg.sender][bytes32("ETH")] >= amount,'Insuffient balance');
       balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].sub(amount);
       msg.sender.call{value:amount}("");
   }


}
