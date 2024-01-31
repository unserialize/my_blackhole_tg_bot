import dotenv from 'dotenv'
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import { beginCell, Cell, toNano } from 'ton-core';
import querystring from 'querystring';

dotenv.config()

const TG_BOT_API_KEY = process.env.TG_BOT_API_KEY
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

if (!TG_BOT_API_KEY || !CONTRACT_ADDRESS) {
  throw ".env file not initialized properly"
}


const bot = new TelegramBot(TG_BOT_API_KEY, { polling: true })

function prepareMessageWithALinkToSignByWallet(transactionDesc: string, cell: Cell, amount: bigint): SendMessageOptions {
  // I couldn't find a way to construct any "universal link", so that a user clicks on it and chooses a wallet, like in TON Connect
  // the only way I could find is to construct links to different wallets

  const cellBin = cell.toBoc({ idx: false }).toString("base64")

  // https://developers.tonhub.com/docs/transfer-link
  const urlTonhub = `https://test.tonhub.com/transfer/${CONTRACT_ADDRESS}?` + querystring.stringify({
    text: transactionDesc,
    amount: amount.toString(),
    bin: cellBin,
  })
  // https://github.com/tonkeeper/wallet-api?tab=readme-ov-file#transaction-request
  // I couldn't find a way to make Tonkeeper work with testnet via links
  const urlTonkeeper = `https://app.tonkeeper.com/transfer/${CONTRACT_ADDRESS}?` + querystring.stringify({
    text: transactionDesc,   // seems that Tonkeeper doesn't show text at all
    amount: amount.toString(),
    bin: cellBin,
  })

  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Sign with TonHub', url: urlTonhub }],
        [{ text: 'Sign with TonKeeper', url: urlTonkeeper }],
      ],
    },
  }
}

// handle /start command
bot.onText(/^\/start$/, async (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! See the buttons", {
    reply_markup: {
      keyboard: [
        [{ text: 'sendIncrement(3)' }],
        [{ text: 'sendDeposit(1 TON)' }],
      ],
    },
  }).catch(console.error)
})

// handle sendIncrement keyboard button: call smart contract
bot.onText(/^sendIncrement/, async (msg, match) => {
  // see my_smart_contract.fc
  const cell = beginCell()
    .storeUint(1, 32)   // opcode
    .storeUint(3, 32)   // inc_by
    .endCell()

  const options = prepareMessageWithALinkToSignByWallet('increment by 3', cell, toNano("0.05"))
  bot.sendMessage(msg.chat.id, "Click to approve the transaction:", options).catch(console.error)
  // when the user approves and transaction is finished, changes can be seen in web app
})

// handle sendDeposit keyboard button: call smart contract
bot.onText(/^sendDeposit/, async (msg, match) => {
  // see my_smart_contract.fc
  const cell = beginCell()
    .storeUint(2, 32)   // opcode
    .endCell()

  const options = prepareMessageWithALinkToSignByWallet('deposit 1 TON', cell, toNano(1))
  bot.sendMessage(msg.chat.id, "Click to approve the transaction:", options).catch(console.error)
  // when the user approves and transaction is finished, changes can be seen in web app
})

bot.onText(/counter_value/, async (msg, match) => {
  // to implement calling get methods (show counter_value, show balance, etc.),
  // we also need to npm install TonClient, @orbs-network and so on — to query TON api
  // it's obvious and already done in my_blackhole_contract, so skipped
  // (this experiment was focused on signing transactions by generating urls)
})
