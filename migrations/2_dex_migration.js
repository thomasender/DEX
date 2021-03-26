const Dex = artifacts.require("Dex");

module.exports = async function (deployer) {
  deployer.deploy(Dex);
};
