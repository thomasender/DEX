var web3 = new Web3(Web3.givenProvider);

$(document).ready(function() {
      window.ethereum.enable().then(async function(accounts){
      dex = await new web3.eth.Contract(window.abi, "0x2E33E198c1C7B4055Ba62a143fea2693d7D5a4bE", {from: accounts[0]});
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
    $("#btnAddToken").click(addToken);


    async function prtTokenBalances(){
      let tokenListLength = await dex.methods.getTokenListLength().call();
      for (let i = 0; i < tokenListLength; i++){
        let tokenListVar = await dex.methods.tokenList(i).call();
        let newBalance = await dex.methods.balances(ethereum.selectedAddress, tokenListVar).call();
        console.log("Balance of " + web3.utils.toUtf8(tokenListVar) + " " + newBalance);
      }
    }


    async function addToken(){
        let newTicker = $("#newTicker").val();
        console.log(newTicker);
        await dex.methods.addToken(web3.utils.fromUtf8(newTicker), "0x2F7e1754aB78B574cC1fAfb4c93556fa6e90F194").send();
        let newToken = await dex.methods.tokenMapping(web3.utils.fromAscii(newTicker)).call();
        await dex.methods.deposit(10, web3.utils.fromUtf8(newTicker));
        reloadPage();
    }


    async function prtTokenList(){
      let tokenListLength = await dex.methods.getTokenListLength().call();
      console.log("Tokenlist length is " + tokenListLength);
      for (let i = 0; i < tokenListLength; i++){
        let tokenList = await dex.methods.tokenList(i).call();
        console.log(web3.utils.toUtf8(tokenList));
        $('<p />').text("TokenTicker:" + web3.utils.toUtf8(tokenList)).appendTo('.TokenListOut');
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
      let price = orderBookBuy[i]["price"];
      console.log(ticker, amount, price);
      $('<tr />').appendTo('.OrderbookOutPut');

      $('<td />').text("Ticker: " + web3.utils.toUtf8(ticker).toString()).appendTo('.OrderbookOutPut');
      $('<td />').text("Amount: " + amount).appendTo('.OrderbookOutPut');
      $('<td />').text("Price: " + web3.utils.fromWei(price).toString()).appendTo('.OrderbookOutPut');
      }

    }//END OF prtOrderbook

    async function prtOrderbookSell(){
      let orderBookSell = await dex.methods.getOrderBook(web3.utils.fromAscii("LINK"), 1).call();
      console.log(orderBookSell);
    for (let i = 0; i < orderBookSell.length; i++){
      let tickerSell = orderBookSell[i]["ticker"];
      let amountSell = orderBookSell[i]["amount"];
      let priceSell = orderBookSell[i]["price"];
      console.log(tickerSell, amountSell, priceSell);
      $('<tr />').appendTo('.OrderbookSellOutPut');
      $('<td />').text("Ticker: " + web3.utils.toUtf8(tickerSell).toString()).appendTo('.OrderbookSellOutPut');
      $('<td />').text("Amount: " + amountSell).appendTo('.orderBookSellOutPut');
      $('<td />').text("Price: " + web3.utils.fromWei(priceSell).toString()).appendTo('.OrderbookSellOutPut');

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
