pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet{

    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

    uint public nextOrderId = 0;

    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
        return orderBook[ticker][uint(side)];
    }

  function depositEth() payable external {
      balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].add(msg.value);
   }

   function withdrawEth(uint amount) external {
       require(balances[msg.sender][bytes32("ETH")] >= amount,'Insufficient balance');
       balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].sub(amount);
       msg.sender.call{value:amount}("");
   }


    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public{
        if(side == Side.BUY){
            require(balances[msg.sender]["ETH"] >= amount.mul(price));
        }
        else if(side == Side.SELL){
            require(balances[msg.sender][ticker] >= amount);
        }

        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(
            Order(nextOrderId, msg.sender, side, ticker, amount, price, 0)
        );

        //Bubble sort
        uint i = orders.length > 0 ? orders.length - 1 : 0;
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

    function createMarketOrder(Side side, bytes32 ticker, uint amount) public{
        if(side == Side.SELL){
            require(balances[msg.sender][ticker] >= amount, "Insuffient balance");
        }

        uint orderBookSide;
        if(side == Side.BUY){
            orderBookSide = 1;
        }
        else{
            orderBookSide = 0;
        }
        Order[] storage orders = orderBook[ticker][orderBookSide];

        uint totalFilled = 0;

        for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
            uint leftToFill = amount.sub(totalFilled);
            uint availableToFill = orders[i].amount.sub(orders[i].filled);
            uint filled = 0;
            if(availableToFill > leftToFill){
                filled = leftToFill; //Fill the entire market order
            }
            else{
                filled = availableToFill; //Fill as much as is available in order[i]
            }

            totalFilled = totalFilled.add(filled);
            orders[i].filled = orders[i].filled.add(filled);
            uint cost = filled.mul(orders[i].price);

            if(side == Side.BUY){
                //Verify that the buyer has enough ETH to cover the purchase (require)
                require(balances[msg.sender]["ETH"] >= cost);
                //msg.sender is the buyer
                balances[msg.sender][ticker] = balances[msg.sender][ticker].add(filled);
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(cost);

                balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].add(cost);
            }
            else if(side == Side.SELL){
                //Msg.sender is the seller
                balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(filled);
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].add(cost);

                balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].add(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].sub(cost);
            }

        }
            //Remove 100% filled orders from the orderbook
        while(orders.length > 0 && orders[0].filled == orders[0].amount){
            //Remove the top element in the orders array by overwriting every element
            // with the next element in the order list
            for (uint256 i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i + 1];
            }
            orders.pop();
        }

    }

    function getTokenListLength() public returns (uint){
      return tokenList.length;
    }
}

//OLD CODE
/*pragma solidity >=0.6.0 <0.8.0;
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
    uint filled;
  }



  uint public nextOrderId = 0;

  mapping (bytes32 => mapping (uint => Order[])) public orderBook;

  function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
      return orderBook[ticker][uint(side)];
  }



    function depositEth() payable external {
         balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].add(msg.value);
     }

     function withdrawEth(uint amount) external {
         require(balances[msg.sender][bytes32("ETH")] >= amount,'Insufficient balance');
         balances[msg.sender][bytes32("ETH")] = balances[msg.sender][bytes32("ETH")].sub(amount);
         msg.sender.call{value:amount}("");
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
        Order(nextOrderId, msg.sender, side, ticker, amount, price, 0)
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



function createMarketOrder(Side side, bytes32 ticker, uint amount) public payable {
  if(side == Side.SELL){
    require(balances[msg.sender][ticker] >= amount, "Insufficient funds!");

  }

  uint orderBookSide;

  if(side == Side.BUY){
    orderBookSide = 1;
  }
  else if(side == Side.SELL){
    orderBookSide = 0;
  }
  Order[] storage orders = orderBook[ticker][orderBookSide];

  uint totalFilled = 0;

  for (uint256 i = 0; i < orders.length && totalFilled < amount; i++){

    //How much can we fill from order[i]
    uint neededToFill = amount.sub(totalFilled);
    uint availableToFill = orders[i].amount.sub(orders[i].filled);
    uint isFilled = 0;
    if(availableToFill > neededToFill){
      isFilled = neededToFill; //If entire order is ready to be filled
    }
    else if(availableToFill <= neededToFill){
      isFilled = availableToFill; //If order[i] is only partially filled
    }
    //Update totalFilled;
    totalFilled = totalFilled.add(isFilled);
    //Update order
    orders[i].filled = orders[i].filled.add(isFilled);

    uint cost = isFilled.mul(orders[i].price);

    if(side == Side.BUY){
      //Verify that buyer has enough ETH to cover buy
      require(balances[msg.sender]["ETH"] >= cost);  //isFilled stands for how much is available to fill from previous calculation, see "HOW MUCH CAN WE FILL" - Code
      //Execute the trade (adjust balances)
      balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(cost); //decrease eth balance of buyer
      balances[msg.sender][ticker] = balances[msg.sender][ticker].add(isFilled); //increase Token balance of buyer

      balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].add(cost);  //increase eth balance of seller
      balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(isFilled); //decrease token balance of seller
    }
    else if(side == Side.SELL){
      //Execute the trade (adjust balances)
      balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(isFilled); //increase Token balance of buyer
      balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].add(cost); //decrease eth balance of buyer

      balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].add(isFilled); //decrease token balance of seller
      balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].sub(cost);  //increase eth balance of seller
    }
  } //For loop close Bracket

  //Loop through orderBook and remove 100% Filled orders
  while(orders[0].filled == orders[0].amount && orders.length > 0){
    //Remove the top order from order array by overwriting every element with the next element, shifting the elements in the array!
    for(uint i = 0; i < orders.length - 1; i++){
      orders[i] = orders[i+1];
    }
    orders.pop();
  }

} //createMarketOrder close Bracket



//MY TRY ON createMarketOrder
/*
if(orders.length == 0){
  Order memory newOrder = (nextOrderId, msg.sender, side, ticker, amount);
  marketOrders.push(newOrder);
}
if(orders[i].ticker >= amount){

  if(orders[i].amount == 0){
    //delete LimitOrder
  }
  else {
    orderBookSide = 0;
    orders[i].amount = orders[i].amount.sub(amount);

  }
}
*/


/*
}
*/
