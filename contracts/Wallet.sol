pragma solidity >=0.6.0 <0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable  {

  using SafeMath for uint256;

  struct Token{
    bytes32 ticker;
    address tokenAddress;
  }

  modifier tokenExist(bytes32 ticker){
    require(tokenMapping[ticker].tokenAddress != address(0), "Token does not exist!");  //checks if token exists!

    _;
  }

  //will store all tickers(Tokensymbols)
  bytes32[] public tokenList;
  //will point to the token structs
  mapping (bytes32 => Token) public tokenMapping;  //stores token structs with symbol/ticker as key, let's us access for examples tokenMapping[ticker].ticker for getting symbol and tokenMapping[ticker].tokenAddress for getting address

  //points to balances of different tokens, first key address of tokenHolder, second key token Symbol/ticker
  mapping (address => mapping(bytes32 => uint256)) public balances;

  function addToken(bytes32 ticker, address tokenAddress) payable onlyOwner external{ //to add a new token, called from another contract therefore external
    tokenMapping[ticker] = Token(ticker, tokenAddress);             //creates new token struct and adds it to the token mapping using the ticker as key.struct holds ticker and address as parameters
    tokenList.push(ticker);                                         //pushes ticker to tokenList
  }

  function deposit(uint amount, bytes32 ticker) tokenExist(ticker) external {


    IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount); //uses transferFrom function from IERC20 to transfer from msg.sender to Token mapping in contract (address(this))
    balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);                  //updates balance mapping in contract

  }

  function withdraw(uint amount, bytes32 ticker) tokenExist(ticker) external{

    require(balances[msg.sender][ticker] >= amount, "Balances insufficient!");


    balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
    IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
  }


}
