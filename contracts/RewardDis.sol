// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;
pragma experimental ABIEncoderV2;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract RewardDistribution is HederaTokenService {
    address public mstTokenAddress;
    address public mptTokenAddress;
    address public treasuryAddress;

    mapping(address => uint64) public staked;
    mapping(address => uint64) public rewards;
    mapping(address => uint64) public lastUpdateTime;
    address[] public stakers;
    uint64 public totalStaked;
    uint64 public totalRewardPool;

    event Staked(address indexed user, uint64 amount);
    event Unstaked(address indexed user, uint64 amount);
    event RewardClaimed(address indexed user, uint64 reward);
    event RewardAdded(uint64 amount);
    event TransactionProcessed(address indexed sender, uint64 amount);

    constructor(address _mstTokenAddress, address _mptTokenAddress, address _treasuryAddress) {
        mstTokenAddress = _mstTokenAddress;
        mptTokenAddress = _mptTokenAddress;
        treasuryAddress = _treasuryAddress;
    }

    function transferMstTokens(uint64 amount, address recipient) external {
        int response = HederaTokenService.transferToken(mstTokenAddress, msg.sender, recipient, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Transfer Mst Failed");
        }
        emit TransactionProcessed(msg.sender, amount);
    }

    function unstakeTokens(uint64 amount) external {
        require(staked[msg.sender] >= amount, "Cannot unstake more than staked amount");
        updateReward(msg.sender);
        staked[msg.sender] -= amount;
        totalStaked -= amount;
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
        lastUpdateTime[msg.sender] = uint64(block.timestamp);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external {
        updateReward(msg.sender);
        uint64 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        int response = HederaTokenService.transferToken(mptTokenAddress, treasuryAddress, msg.sender, int64(reward));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Claim Rewards Failed");
        }
        totalRewardPool -= reward;
        emit RewardClaimed(msg.sender, reward);
    }

    function updateReward(address user) internal {
        if (staked[user] > 0 && totalStaked > 0) {
            uint256 rewardDelta = (uint256(staked[user]) * (block.timestamp - lastUpdateTime[user]) * totalRewardPool) / totalStaked / 1 days;
            rewards[user] += uint64(rewardDelta);
        }
        lastUpdateTime[user] = uint64(block.timestamp);
    }

    function addReward(uint64 amount) internal {
        totalRewardPool += amount;
        emit RewardAdded(amount);
    }

    function distributeRewards() external {
        for (uint64 i = 0; i < stakers.length; i++) {
            updateReward(stakers[i]);
        }
    }

    function transferMptTokens(uint64 amount, address recipient) external {
        int response = HederaTokenService.transferToken(mptTokenAddress, msg.sender, recipient, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Transaction Failed");
        }
        uint64 reward = amount / 10;
        addReward(reward);
        emit TransactionProcessed(msg.sender, amount);
    }

    function mintTokens(address token, uint64 amount) external {
        bytes[] memory data = new bytes[](1);
        data[0] = new bytes(amount);
        (int response, , ) = HederaTokenService.mintToken(token, int64(amount), data);
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Mint Failed");
        }
    }

    function associateMSTToken(address user) external {
        int response = HederaTokenService.associateToken(user, mstTokenAddress);
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Associate MST Token Failed");
        }
    }

    function associateMPTToken(address user) external {
        int response = HederaTokenService.associateToken(user, mptTokenAddress);
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Associate MPT Token Failed");
        }
    }

    function stakeTokens(uint64 amount) external {
        int response = HederaTokenService.transferToken(mstTokenAddress, msg.sender, treasuryAddress, int64(amount));
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Stake Failed");
        }
        updateReward(msg.sender);
        if (staked[msg.sender] == 0) {
            stakers.push(msg.sender);
        }
        staked[msg.sender] += amount;
        totalStaked += amount;
        lastUpdateTime[msg.sender] = uint64(block.timestamp);
        emit Staked(msg.sender, amount);
    }

    function getStakes(address user) external view returns (uint64) {
        return staked[user];
    }

    function getRewards(address user) external view returns (uint64) {
        return rewards[user];
    }
}
