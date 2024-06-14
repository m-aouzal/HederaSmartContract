// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;
pragma experimental ABIEncoderV2;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

library SafeMath {
    function add(uint64 a, uint64 b) internal pure returns (uint64) {
        uint64 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint64 a, uint64 b) internal pure returns (uint64) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint64 c = a - b;
        return c;
    }

    function mul(uint64 a, uint64 b) internal pure returns (uint64) {
        if (a == 0) {
            return 0;
        }
        uint64 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint64 a, uint64 b) internal pure returns (uint64) {
        require(b > 0, "SafeMath: division by zero");
        uint64 c = a / b;
        return c;
    }
}

contract RewardDistribution is HederaTokenService {
    using SafeMath for uint64;

    address public mstTokenAddress;
    address public mptTokenAddress;
    address public treasuryAddress;

    mapping(address => uint64) public staked;
    mapping(address => uint64) public rewards;
    mapping(address => uint64) public lastCumulativeRewardPerToken;
    address[] public stakers;
    uint64 public totalStaked;
    uint64 public cumulativeRewardPerToken;
    uint64 public totalRewardPool;

    event Staked(address indexed user, uint64 amount);
    event Unstaked(address indexed user, uint64 amount);
    event RewardClaimed(address indexed user, uint64 reward);
    event TransactionProcessed(address indexed sender, uint64 amount);
    event Debug(string message, uint64 value);
    event DebugAddress(string message, address value);
    event DebugUint64(string message, uint64 value);

    constructor(address _mstTokenAddress, address _mptTokenAddress, address _treasuryAddress) {
        mstTokenAddress = _mstTokenAddress;
        mptTokenAddress = _mptTokenAddress;
        treasuryAddress = _treasuryAddress;
    }

    function transferMstTokens(uint64 amount, address recipient) external {
        int response = HederaTokenService.transferToken(mstTokenAddress, msg.sender, recipient, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Transfer MST Failed");
        }
        emit TransactionProcessed(msg.sender, amount);
    }

    function unstakeTokens(uint64 amount) external {
        require(staked[msg.sender] >= amount, "Cannot unstake more than staked amount");
        if (staked[msg.sender] > 0) {
            claimRewards();
        }
        staked[msg.sender] = staked[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);
        int response = HederaTokenService.transferToken(mstTokenAddress, treasuryAddress, msg.sender, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Unstake Failed");
        }
        if (staked[msg.sender] == 0) {
            for (uint64 i = 0; i < stakers.length; i++) {
                if (stakers[i] == msg.sender) {
                    stakers[i] = stakers[stakers.length - 1];
                    stakers.pop();
                    break;
                }
            }
        }
        emit Unstaked(msg.sender, amount);
    }

    function unstakeAllTokens() external {
        uint64 amount = staked[msg.sender];
        require(amount > 0, "No tokens to unstake");
        if (staked[msg.sender] > 0) {
            claimRewards();
        }
        staked[msg.sender] = 0;
        totalStaked = totalStaked.sub(amount);
        int response = HederaTokenService.transferToken(mstTokenAddress, treasuryAddress, msg.sender, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Unstake Failed");
        }
        for (uint64 i = 0; i < stakers.length; i++) {
            if (stakers[i] == msg.sender) {
                stakers[i] = stakers[stakers.length - 1];
                stakers.pop();
                break;
            }
        }
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() public {
        if (staked[msg.sender] > 0) {
            updateReward(msg.sender);
            uint64 reward = rewards[msg.sender];
            emit DebugUint64("Reward to claim for user:", reward);
            emit DebugAddress("User claiming reward:", msg.sender);

            if (reward > 0) {
                rewards[msg.sender] = 0; // Set to zero before transfer
                int response = HederaTokenService.transferToken(mptTokenAddress, treasuryAddress, msg.sender, int64(reward));
                if (response != HederaResponseCodes.SUCCESS) {
                    rewards[msg.sender] = reward; // Revert back on failure
                    revert("Claim Rewards Failed");
                }
                totalRewardPool = totalRewardPool.sub(reward); // Update reward pool
                emit RewardClaimed(msg.sender, reward);
            }
        }
    }

    function updateReward(address user) internal {
        emit DebugAddress("Updating reward for user:", user);
        emit DebugUint64("Staked amount for user:", staked[user]);

        if (staked[user] > 0) {
            uint64 rewardDelta = cumulativeRewardPerToken.sub(lastCumulativeRewardPerToken[user]).mul(staked[user]);
            emit Debug("Reward Delta:", rewardDelta);

            if (rewardDelta > 0) { // Check if rewardDelta is positive
                rewards[user] = rewards[user].add(rewardDelta.div(1e6)); // Adjusting for decimal precision
                emit DebugUint64("Updated Rewards:", rewards[user]);
            }
        }
        lastCumulativeRewardPerToken[user] = cumulativeRewardPerToken;
    }

    function addReward(uint64 amount) internal {
        emit DebugUint64("Total staked before add reward:", totalStaked);
        if (totalStaked > 0) { // Check to avoid division by zero
            cumulativeRewardPerToken = cumulativeRewardPerToken.add((amount.mul(1e6)).div(totalStaked)); // Adjusting for decimal precision
            totalRewardPool = totalRewardPool.add(amount);
            emit Debug("New Cumulative Reward Per Token:", cumulativeRewardPerToken);
            emit DebugUint64("Total Reward Pool:", totalRewardPool);
        }
    }

    function transferMptTokens(uint64 amount, address recipient) external {
        int response = HederaTokenService.transferToken(mptTokenAddress, msg.sender, recipient, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Transfer MPT Failed");
        }
        uint64 reward = amount.div(10); // Assuming a 10% reward is added to the pool
        addReward(reward);
        emit TransactionProcessed(msg.sender, amount);
    }

    function stakeTokens(uint64 amount) external {
        if (staked[msg.sender] > 0) {
            claimRewards(); // Claim rewards before staking if user already has staked tokens
        }
        int response = HederaTokenService.transferToken(mstTokenAddress, msg.sender, treasuryAddress, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Stake Failed");
        }
        if (staked[msg.sender] == 0) {
            stakers.push(msg.sender);
        }
        staked[msg.sender] = staked[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);
        lastCumulativeRewardPerToken[msg.sender] = cumulativeRewardPerToken; // Update last cumulative reward per token for the user
        emit Staked(msg.sender, amount);
    }

    function getStakes(address user) external view returns (uint64) {
        return staked[user];
    }

    function getMyReward() external view returns (uint64) {
        address user = msg.sender;
        if (staked[user] > 0) {
            uint64 rewardDelta = cumulativeRewardPerToken.sub(lastCumulativeRewardPerToken[user]).mul(staked[user]);
            return rewards[user].add(rewardDelta.div(1e6)); // Adjusting for decimal precision
        }
        return rewards[user];
    }

    function getRewardPool() external view returns (uint64) {
        return totalRewardPool;
    }

    function getCumulativeRewardPerToken() external view returns (uint64) {
        return cumulativeRewardPerToken;
    }

    function getLastCumulativeRewardPerToken(address user) external view returns (uint64) {
        return lastCumulativeRewardPerToken[user];
    }
}
