var web3 = new Web3(Web3.givenProvider);

$(document).ready(function() {
      window.ethereum.enable().then(async function(accounts){
      dex = await new web3.eth.Contract(window.abi, "0x410b08d8C60322a455fA7e3932260EEbDe6Bf83e", {from: accounts[0]});
      prtETHBalance();
      prtOrderbook();
      prtOrderbookSell();
      prtTokenList();
      prtTokenBalances();
    });

    $("#btnPlaceOrder").click(placeLimitOrder);
    $("#btnDepositETH").click(depositEther);
    $("#btnWithdrawETH").click(withdrawEther);
    $("#btnRefreshOrderbook").click(reloadPage);
    $("#btnRefreshOrderbook2").click(reloadPage);
  //  $("#btnAddToken").click(addToken);  //Not useful in this project, therefore commented
    $("#btnWithdrawToken").click(withdrawToken);
    $("#btnDepositToken").click(depositToken);
    $("#btnPlaceMarketOrder").click(placeMarketOrder);



    async function depositToken(){
      let amountTokenDeposit = $("#depositTokenAmount").val();
      console.log(amountTokenDeposit);
      await dex.methods.deposit(amountTokenDeposit, web3.utils.fromUtf8("LINK")).send();
    }

    async function withdrawToken(){
      let amountTokenWithdraw = $("#withdrawTokenAmount").val();
      console.log(amountTokenWithdraw);
      await dex.methods.withdraw(amountTokenWithdraw, web3.utils.fromUtf8("LINK")).send();
    }

    async function prtTokenBalances(){
      let tokenListLength = await dex.methods.getTokenListLength().call();
      for (let i = 0; i < tokenListLength; i++){
        let tokenListVar = await dex.methods.tokenList(i).call();
        let newBalance = await dex.methods.balances(ethereum.selectedAddress, tokenListVar).call();
        console.log("Balance of " + web3.utils.toUtf8(tokenListVar) + " " + newBalance);
        $('<tr />').text(web3.utils.toUtf8(tokenListVar) + ": " + newBalance).appendTo(".tokenBalanceOut");
      }
    }

/*   //Not useful in this project, therefore commented
    async function addToken(){
        let newTicker = $("#newTicker").val();
        console.log(newTicker);
        await dex.methods.addToken(web3.utils.fromUtf8(newTicker), "0x9E386CEB23206662B010bca22c1388c77B33216C").send();
        let newToken = await dex.methods.tokenMapping(web3.utils.fromAscii(newTicker)).call();
        await dex.methods.deposit(10, web3.utils.fromUtf8(newTicker));
        reloadPage();
    }
*/

    async function prtTokenList(){
      let tokenListLength = await dex.methods.getTokenListLength().call();
      console.log("Tokenlist length is " + tokenListLength);
      for (let i = 0; i < tokenListLength; i++){
        let tokenList = await dex.methods.tokenList(i).call();
        console.log(web3.utils.toUtf8(tokenList));
        $('<p />').text("Ticker: " + web3.utils.toUtf8(tokenList)).appendTo('.TokenListOut');
      }
    //  let tickerList = await dex.methods.tokenMapping(web3.utils.fromAscii("LINK")).call();
    //  console.log(web3.utils.toUtf8(tickerList[0]));
    //  let newToken = await dex.methods.tokenMapping(web3.utils.fromAscii("TRON")).call();
    //  console.log(web3.utils.toUtf8(newToken[0]));

    }

  async function prtOrderbook(){

    let orderBookBuy = await dex.methods.getOrderBook(web3.utils.fromAscii("LINK"), 0).call();
    console.log(orderBookBuy);

    for (let i = 0; i < orderBookBuy.length; i++){
      let ticker = orderBookBuy[i]["ticker"];
      let amount = orderBookBuy[i]["amount"];
      let price = web3.utils.toWei(orderBookBuy[i]["price"]);
      console.log(ticker, amount, price);
      $('<tr />').appendTo('.OrderbookOutPut');
      $('<td />').text("Ticker: " + web3.utils.toUtf8(ticker).toString()).appendTo('.OrderbookOutPut');
      $('<td />').text("Amount: " + amount).appendTo('.OrderbookOutPut');
      $('<td />').text("Price (in WEI): " + web3.utils.fromWei(price).toString()).appendTo('.OrderbookOutPut');
      }

    }//END OF prtOrderbook

    async function prtOrderbookSell(){
      let orderBookSell = await dex.methods.getOrderBook(web3.utils.fromAscii("LINK"), 1).call();
      console.log(orderBookSell);
    for (let i = 0; i < orderBookSell.length; i++){
      let tickerSell = orderBookSell[i]["ticker"];
      let amountSell = orderBookSell[i]["amount"];
      let priceSell = web3.utils.toWei(orderBookSell[i]["price"]);
      console.log(tickerSell, amountSell, priceSell);
      $('<tr />').appendTo('.OrderbookSellOutPut');
      $('<td />').text("Ticker: " + web3.utils.toUtf8(tickerSell).toString()).appendTo('.OrderbookSellOutPut');
      $('<td />').text("Amount: " + amountSell).appendTo('.OrderbookSellOutPut');
      $('<td />').text("Price (in WEI): " + web3.utils.fromWei(priceSell).toString()).appendTo('.OrderbookSellOutPut');

          }
    }

    function reloadPage(){
      location.reload();
    }

  async function placeLimitOrder(){
    let side = $("#side").val();
    console.log(side);
    let ticker = web3.utils.fromUtf8($("#ticker").val());
    console.log(ticker);
    let amount = $("#amount").val();
    console.log(amount);
    let price = $("#price").val();
    console.log(price);
    await dex.methods.createLimitOrder(side, ticker, amount, price).send();
    reloadPage();

  }

  async function placeMarketOrder(){
    let side = $("#sideMarketOrder").val();
    console.log(side);
    let ticker = web3.utils.fromUtf8($("#tickerMarketOrder").val());
    console.log(ticker);
    let amount = $("#amountMarketOrder").val();
    console.log(amount);
    await dex.methods.createMarketOrder(side, ticker, amount).send();
    alert("ORDERPLACED!");
    reloadPage();

  }


  async function withdrawEther(){
    let withdrawAmountETH = $("#withdrawAmount").val();
    console.log(withdrawAmountETH);
    let balanceBefore = await dex.methods.balances(ethereum.selectedAddress, web3.utils.fromAscii("ETH")).call();
    console.log(balanceBefore);
    await dex.methods.withdrawEth(withdrawAmountETH).send({from: ethereum.selectedAddress});
    let balanceAfter = await dex.methods.balances(ethereum.selectedAddress, web3.utils.fromAscii("ETH")).call();
    console.log(balanceAfter);
    reloadPage();
  }

  async function depositEther(){
    let amountETH = $("#amountETH").val();
    console.log(amountETH);
    let addr = ethereum.selectedAddress;
    console.log(addr);
    let balance = await dex.methods.balances(addr, web3.utils.fromAscii("ETH")).call();
    console.log(balance);
    await dex.methods.depositEth().send({value: web3.utils.toWei(amountETH, "ether")});
    balance = await dex.methods.balances(addr, web3.utils.fromAscii("ETH")).call();
    console.log(balance);
    reloadPage();
  }

  async function prtETHBalance(){
    let currentETHBalance = await dex.methods.balances(ethereum.selectedAddress, web3.utils.fromAscii("ETH")).call();
    document.getElementById("ETHBalanceOut").textContent = web3.utils.fromWei(currentETHBalance);
    document.getElementById("WEIBalanceOut").textContent = currentETHBalance;
  }
}); //closes document.ready
