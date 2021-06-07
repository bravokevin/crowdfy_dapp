//SPDX-License-Identifier: UNLICENSED;

pragma solidity 0.8.0;

import "./Crowdfy.sol";


/**@title Create a new campaign, stores its address and emmit and event*/
contract CrowdfyFabric{
        event CampaignCreated(
        string campaignName,
        address owner, 
        address beneficiary, 
        uint fundingGoal, 
        uint createdTime, 
        uint deadline);

    //Stores the campaign Address
    address[] public campaigns;

    function createCampaign(string memory _campaignName, 
    uint _fundingGoal, 
    uint _deadline, 
    uint _fundingCap, 
    address _beneficiaryAddress
    ) external {
        campaigns.push(address(new Crowdfy(_campaignName, _fundingGoal, _deadline, _fundingCap, _beneficiaryAddress)));

        emit CampaignCreated(_campaignName, tx.origin, _beneficiaryAddress, _fundingCap, block.timestamp, _deadline);

    }
}

