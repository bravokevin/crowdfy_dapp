//SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.8.0;


import "./CrowdfyI.sol";

interface CrowdfyFabricI is CrowdfyI {

    function createCampaign(
        string memory _campaignName, 
        uint _fundingGoal, 
        uint _deadline, 
        uint _fundingCap, 
        address _beneficiaryAddress
    ) external returns(bool);

}