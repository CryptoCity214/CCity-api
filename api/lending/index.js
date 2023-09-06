'use strict';

const {web3Factory} = require("../../utils/web3");
const TotalSupplyAndBorrowABI = require('../../abis/TotalSupplyAndBorrowABI.json');
const { CHAIN_ID } = require("../../constants");
const TotalSupplyAndBorrowAddress = "0x8E94d4C235bb07301A07956ddd50aa7f13be2b53"; // TODO

const web3 = web3Factory( CHAIN_ID );
const TotalSupplyAndBorrow = new web3.eth.Contract(TotalSupplyAndBorrowABI, TotalSupplyAndBorrowAddress);

class Cache {
    minElapsedTimeInMs = 10000; // 10 seconds

    constructor() {
        this.cachedTotal = undefined
    }

    async reloadTotal() {
        if (!this.cachedTotal ||
            this.cachedTotal.lastRequestTimestamp + this.minElapsedTimeInMs < Date.now() // check if supply needs to be updated
        ) {
            const result = await TotalSupplyAndBorrow.methods.getTotalSupplyAndTotalBorrow().call();
            const lastRequestTimestamp = Date.now();
            this.cachedTotal = {supply: result[0], borrow: result[1], lastRequestTimestamp}
        }
    }

    async getTotalSupply() {
        await this.reloadTotal()
        return this.cachedTotal.supply
    }

    async getTotalBorrow() {
        await this.reloadTotal()
        return this.cachedTotal.borrow
    }
}


async function totalSupply(ctx) {
    ctx.body = (await cache.getTotalSupply()).toString();
}

async function totalBorrow(ctx) {
    ctx.body = (await cache.getTotalBorrow()).toString();
}

const cache = new Cache()
module.exports = {totalSupply, totalBorrow};
