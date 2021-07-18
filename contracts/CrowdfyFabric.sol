//SPDX-License-Identifier: UNLICENSED;

pragma solidity 0.8.0;

import "./Crowdfy.sol";
// import "./CrowdfyFabricI.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**@title Factory contract. Follows minimal proxy pattern to deploy each campaigns*/
contract CrowdfyFabric{

    //** **************** STATE VARIABLES ********************** */

    //Stores all campaign addresses
    address[] public campaigns;

    //stores the campaigns 
    mapping(address => Campaign) public campaignsByUser;

    //the address of the base campaign contract implementation
    address immutable campaignImplementation;

    //** **************** EVENTS ********************** */

        event CampaignCreated(
            string campaignName,
            address owner, 
            address beneficiary, 
            uint fundingGoal, 
            uint createdTime, 
            uint deadline,
            address campaignAddress
        );

//** **************** CONSTRUCTOR ********************** */

    constructor(){
        //deploys the campaign base implementation
        campaignImplementation = address(new Crowdfy());
    }



    struct Campaign  {
        string  campaignName;
        uint fundingGoal;//the minimum amount that the campaigns required
        uint fundingCap; //the maximum amount that the campaigns required
        uint deadline;
        address beneficiary;//the beneficiary of the campaign
        address owner;//the creator of the campaign
        uint created; // the time when the campaign was created 
    }





    ///@notice deploy a new instance of the campaign
    function createCampaign(
        string memory _campaignName, 
        uint _fundingGoal, 
        uint _deadline, 
        uint _fundingCap, 
        address _beneficiaryAddress
    ) external returns(bool) {
        
        address cloneContract = Clones.clone(campaignImplementation);

        Crowdfy(cloneContract).initializeCampaign(_campaignName, _fundingGoal, _deadline, _fundingCap, _beneficiaryAddress);

        campaigns.push(cloneContract);

        campaignsByUser[msg.sender] = Campaign
        (
            {
            campaignName: _campaignName,
            fundingGoal: _fundingGoal,
            fundingCap: _fundingCap,
            deadline: _deadline,
            beneficiary: _beneficiaryAddress,
            owner: msg.sender,
            created: block.timestamp
            }
        );

        emit CampaignCreated(_campaignName, msg.sender, _beneficiaryAddress, _fundingCap, block.timestamp, _deadline, cloneContract);

        return true;
    }

    ///@notice gets the number of campaigns created
    function getCampaignsLength() external view returns(uint256){
        return campaigns.length;
    }

    /**@notice gets a campaign by is creator*/
    function getCampaignByUser(address _userAddress) external view returns(Campaign memory){
        return campaignsByUser[_userAddress];
    }

}



