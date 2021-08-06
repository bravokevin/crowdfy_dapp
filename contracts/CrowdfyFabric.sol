//SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.8.0;

import "./Crowdfy.sol";
// import "./CrowdfyFabricI.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**@title Factory contract. Follows minimal proxy pattern to deploy each campaigns*/
contract CrowdfyFabric{

    //** **************** STATE VARIABLES ********************** */

    //Stores all campaign structure
    Campaign[] public campaigns;

    //points each campaigns adddress to an identifier.
    mapping(uint => address) public campaignsById;

    //the address of the base campaign contract implementation
    address immutable campaignImplementation;

    //** **************** EVENTS ********************** */

        event CampaignCreated(
            string campaignName,
            address creator, 
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
        uint256 fundingGoal;//the minimum amount that the campaigns required
        uint256 fundingCap; //the maximum amount that the campaigns required
        uint256 deadline;
        address beneficiary;//the beneficiary of the campaign
        address owner;//the creator of the campaign
        uint256 created; // the time when the campaign was created 
        address campaignAddress;
    }




    ///@notice deploy a new instance of the campaign
    function createCampaign(
        string memory _campaignName, 
        uint _fundingGoal, 
        uint _deadline, 
        uint _fundingCap, 
        address _beneficiaryAddress,
        string calldata _ipfsHash
    ) external returns(uint256) {

        address campaignCreator = msg.sender;
        
        address cloneContract = Clones.clone(campaignImplementation);

        Crowdfy(cloneContract).initializeCampaign(
            _campaignName,
             _fundingGoal, 
            _deadline,
            _fundingCap, 
            _beneficiaryAddress, 
            campaignCreator,
            _ipfsHash
        );

       campaigns.push(Campaign(
                {
                campaignName: _campaignName,
                fundingGoal: _fundingGoal,
                fundingCap: _fundingCap,
                deadline: _deadline,
                beneficiary: _beneficiaryAddress,
                owner: campaignCreator,
                created: block.timestamp,
                campaignAddress: cloneContract
                }
            )
        );

        uint256 campaignId = campaigns.length -1;

        campaignsById[campaignId] = cloneContract;

        emit CampaignCreated(_campaignName, campaignCreator, _beneficiaryAddress, _fundingCap, block.timestamp, _deadline, cloneContract);

        return campaignId;
    }

    ///@notice gets the number of campaigns created
    function getCampaignsLength() external view returns(uint256){
        return campaigns.length;
    }

}



