 Hedera Reward Distribution

This project implements an application for managing reward distribution using the Hedera Token Service (HTS). It involves staking, transferring, and claiming rewards using two tokens: Mintable Staking Token (MST) and Mintable Payment Token (MPT). The smart contract handles the distribution of rewards in a fair and transparent manner.

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
- **Access Control**: The delete function is blocked for four fixed accounts to prevent unauthorized modifications. This is vital to the application to maintain its integrity. The specific accounts that cannot be deleted are:
  - `DJO0nIlR1DyydwYhB5Xy`
  - `SlZx5gHcsz9eCCEdA6nc`
  - `oMKQR1mhQw1DJCJfacN8`
  - `sb9uyt5VVkOBa7OYXBih`

### Technologies Used

- **Hedera SDK**: Used for interacting with the Hedera network and performing token operations.
- **Hedera Token Service (HTS)**: Used within the smart contract to manage token transfers and staking functionalities.
- **Angular**: Used for building the front-end of the application.
- **Firebase**: Used for real-time database and authentication.

### Login Credentials

To try out our application, use the following credentials:

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

You can access the application at [https://hederarewarddistribution.web.app/login](https://hederarewarddistribution.web.app/login)


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

## Getting Started

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


### Instructions for Setting Up the Application

1. **Install Dependencies**: Run the following command to install the necessary dependencies for the project:

   ```bash
   npm install
   ```

2. **Install Hashgraph SDK**: Next, install the Hashgraph SDK with the command:

   ```bash
   npm install --save @hashgraph/sdk
   ```

3. **Run the Development Server**: Finally, start the development server by executing:

   ```bash
   ng serve
   ```

4. **Access the Application** You can access the application directly via the web at https://hederarewarddistribution.web.app/ or open your web browser and navigate to http://localhost:4200/. The application will automatically reload if you change any of the source files.

