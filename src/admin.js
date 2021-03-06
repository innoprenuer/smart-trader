import { v4 as uuidv4 } from 'uuid'
let path = require('path')
let fileName = path.basename(__filename)
import { startLoop } from './trader'
import { intializeExchange } from './exchanges'
import { updateTradeTimes } from './timer'
import { logger } from './server/middlewares'
import { sleep } from './utils/wait'
import { reportError } from './notifiers'

require('dotenv').config()



//trading control flag
var shouldTrade = true
var wait = 30
//initialise pairs object
global.pairs = {}

export function setWaitPeriod(periodInSec) {
    wait = periodInSec
    return { code: 200, message: `Wait period updated to ${periodInSec}` }
}
//pause trading
export function pauseTrading() {
    shouldTrade = false
}

//resume trading
export function resumeTrading() {
    shouldTrade = true
    startTrading()
}

//stop trading 
export async function stopTrading() {
    process.exit(0)
}

// add pair 
export async function addPair(pair) {
    pair.id = uuidv4()
    pair.exchange = intializeExchange(pair.exchangeId)
    pair.canTrade = true
    pair.orders = []
    global.pairs[pair.symbol] = pair
    // add trade times
    await updateTradeTimes(pair)
    return { code: 200, message: { id: pair.id, symbol: pair.symbol } }
}

//start trading
export async function startTrading() {
    while (shouldTrade) {
        try {
            startLoop()
            await sleep(wait)
        } catch (err) {
            reportError(err.message)
        }

    }

}



