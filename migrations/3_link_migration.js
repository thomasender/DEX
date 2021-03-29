const Link = artifacts.require("Link");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Link);
  let link = await Link.deployed();
  let dex = await Dex.deployed();

  dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
  await link.approve(dex.address, 100000);
  await dex.deposit(10000, web3.utils.fromUtf8("LINK"));
  let allowanceDex = await link.allowance(link.address, dex.address);
  console.log(allowanceDex);
  let balanceDex = await link.balanceOf(dex.address);
  console.log(balanceDex);
};
