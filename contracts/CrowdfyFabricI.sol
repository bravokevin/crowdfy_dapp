//SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.8.0;

interface CrowdfyFabricI {

/**@notice this function creates an instance of the crowdfy contract and then stores that instance in an array. Also stores the address of the camppaign created
in a mapping pointing with an id
    @param _campaignName the name of the campaign
    @param _fundingGoal the miinimum amount to make the campaign success
    @param _fundingCap the maximum amount to collect, when reached the campaign 
    closes
    @param _beneficiaryAddress the address ot the beneficiary of the campaign
    @param _ipfsHash the ipfs hash in where the long details of the campaign are stored


    @dev this function follows the minimal proxi pattern to creates the instances
    of the crowdfy contract
*/
    function createCampaign(
        string calldata _campaignName, 
        uint _fundingGoal, 
        uint _deadline, 
        uint _fundingCap, 
        address _beneficiaryAddress,
        string calldata _ipfsHash
    ) external returns(uint256);

}