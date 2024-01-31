# Simple Telegram bot for "communicating" with a TON contract

The purpose is to make some experiments around Telegram bots and TON.

[Smart contract](https://github.com/unserialize/my_blackhole_contract)
(published [in testnet](https://testnet.tonscan.org/address/EQD4Nu_attpQdAHKaSOKSUwAfpJUrXIstF5yGqZvYr-RJT6e))
has some actions, and this bot can send this actions to the contract
on behalf of the user (if a user signs a transaction with his wallet).

To launch, `.env` file with proper variables (see `index.ts`) should be created.
For local testing, you'll need ngrok, probably.
