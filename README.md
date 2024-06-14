# Hedera Reward Distribution DApp

This project implements a decentralized application (DApp) for managing reward distribution using the Hedera Token Service (HTS). It involves staking, transferring, and claiming rewards using two tokens: Mintable Staking Token (MST) and Mintable Payment Token (MPT). The smart contract handles the distribution of rewards in a fair and transparent manner.

## Admin Dashboard

The Admin Dashboard is built with Angular and Firebase. It allows admins to manage the application, view balances, perform token transfers, and monitor the reward distribution. Firebase is used for real-time database and authentication.

### Features

- **Real-time Database**: Firebase is used to keep track of user accounts, token balances, and transaction histories in real-time.
- **Authentication**: Firebase Authentication is used to manage user logins and permissions.
- **Staking MST**: Users can stake their MST tokens to participate in the reward distribution.
- **Transferring MPT**: Users can transfer MPT tokens, with a portion of the transfer amount added to the reward pool.
- **Claiming Rewards**: Users can claim their accrued rewards based on their staked MST tokens.
- **Unstaking MST**: Users can unstake their MST tokens and withdraw their staked amount.
- **Admin Operations**: Admins can manage token balances, mint new tokens, oversee the reward distribution process, and handle account creation for users who will be connected to a wallet.
- **Access Control**: The delete function is blocked for fixed accounts and tokens to prevent unauthorized modifications. This is vital to the application to maintain its integrity.

### Technologies Used

- **Hedera SDK**: Used for interacting with the Hedera network and performing token operations.
- **Hedera Token Service (HTS)**: Used within the smart contract to manage token transfers and staking functionalities.

### Login Credentials

To access the Admin Dashboard, use the following credentials:

- **Admin**
  - Email: `admin@hedera.com`
  - Password: `hedera`

- **Users**
  - User 1
    - Email: `user1@hedera.com`
    - Password: `hedera1`
  - User 2
    - Email: `user2@hedera.com`
    - Password: `hedera2`
  - User 3
    - Email: `user3@hedera.com`
    - Password: `hedera3`

## Project Steps

### 1. Token Creation

We started by creating two tokens on the Hedera Token Service (HTS): a staking token (MST) and a payment token (MPT). These tokens are essential to our application.

### 2. Creating Accounts on Hedera Testnet

We then created accounts on the Hedera Testnet, allowing us to test our features safely before deploying them to production.

### 3. Development of the Reward Distribution Smart Contract

The reward distribution smart contract is the core of our project. Here is how it works:

- **Cumulative Register**: This register tracks the accumulated rewards for each user based on their staked tokens. During each update (stake, unstake, or claim), we recalculate the rewards to ensure fair distribution.
- **Staking Function**: When a user stakes tokens, their record is updated in the cumulative register, and we call the reward claim function to pay any due rewards before adding new tokens to the stake.
- **Reward Claim Function**: This function calculates the rewards owed to each user and updates the cumulative register. Rewards are then transferred transparently.
- **Unstaking Function**: When a user withdraws their tokens, we update the cumulative register, calculate the owed rewards, and transfer the remaining tokens and accumulated rewards in the same transaction.

### 4. Implementation of Allowance

After deploying the contract, it is crucial to allow the contract to manage users' tokens. This is where the allowance feature comes in, allowing users to delegate the management of their tokens to the smart contract. This ensures secure and automated token management.

### 5. Application Development

We developed two main interfaces: an admin panel and a user dashboard.

- **Admin Panel**:
  - The admin can add accounts, create tokens, and transfer MST and MPT tokens to users for testing.
  - We used Firebase for the backend and deployment of our application. The admin handles account creation, a task typically managed by wallets.

- **User Dashboard**:
  - Users can send MPT tokens, associate favorites, stake and unstake MST tokens, and claim rewards. All these actions are integrated into an intuitive interface for a better user experience.

### User Experience

User experience is at the heart of our application. For admins, the admin panel simplifies and speeds up testing by allowing centralized management of accounts and tokens. This is particularly useful for quickly testing various application features.

For users, the dashboard offers a "Add to Favorites" feature. Users can associate names with their favorite accounts, making transactions easier. Given that remembering numbers and figures can be cumbersome, this feature improves their experience by allowing the use of nicknames. However, it is limited to accounts added by the admin, as account creation by external wallets is not covered by this project due to legal constraints.

When a user performs a staking or reward claiming transaction, there is a necessary delay for confirmation on the network. On Hedera, this delay is short, taking only 3 to 5 seconds to achieve transaction finality, unlike Ethereum, which can take 10 to 15 minutes. After each transaction, we introduce a 5-second wait before checking the new balance, demonstrating the speed and efficiency of Hedera Hashgraph.

## Getting 


The contract exists in the contracts folder. You will find the following files:

createToken.js
association.js
allowance.js
deployContract.js
RewardDistribution.sol


### Prerequisites

- Node.js
- Angular CLI
- Firebase Account

# SmartContract

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
