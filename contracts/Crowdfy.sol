//SPDX-License-Identifier: UNLICENSED;
pragma solidity ^0.8.0;

//import "./CrowdfyI.sol";

contract Crowdfy {
    
    /**ENUMS */

    //The posible states of the campaign
    enum State {
        Ongoing,
        Failed,
        Succeded,
        Finalized
    }


        /** EVENTS */
    // event ContributionMade(Contribution _contribution);

    // event CampaignFinished(
    //     address addr,
    //     uint totalCollected,
    //     bool suceeded
    // );

    //Campaigns dataStructure
    struct Campaign  {
        string  campaignName;
        uint fundingGoal;//the minimum amount that the campaigns required
        uint fundingCap; //the maximum amount that the campaigns required
        uint deadline;
        address beneficiary;//the beneficiary of the campaign
        address owner;//the creator of the campaign
        uint created; // the time when the campaign was created
        bool collected; //to see if we collected the enough amount of foounds
        State state; //the current state of the campaign
        uint amountRised;  
    }

    //Contribution datastructure
    struct Contribution {
        address sender;
        uint value;
        uint time;
    }

    // mapping(address => Contribution[]) public contributionsByPeople; // to see how much each account deposit

    Campaign public newCampaign;

        /** MODIFIERS  */
    // modifier inState(State _expectedState){
    //     require(Campaign.state == _expectedState, "Invalid state");
    //     _;
    // }

    constructor (
        string memory _campaignName,
        uint _fundingGoal,
        uint _deadline,
        uint _fundingCap,
        address _beneficiaryAddress)
    {
        newCampaign = Campaign(
            {
            campaignName: _campaignName,
            fundingGoal: _fundingGoal,
            fundingCap: _fundingCap,
            deadline: _deadline,
            beneficiary: _beneficiaryAddress,
            owner: tx.origin,
            created: block.timestamp,
            collected: false,
            state: State.Ongoing,
            amountRised: 0
            }
        );


    }

    


    // function contribute() public payable inState(State.Ongoing) /**returns(uint256 _contributionID)*/{

    //     require(msg.value > 0, "Put a correct amount");

    //     contributionID = contributions.length;
    //     contributionID++;


    //     contributions[contributionID] = Contribution(
    //         {
    //         sender: msg.sender,
    //         amount: msg.value,
    //         created: block.timestamp
    //         }
    //     );

    //     contributionsByPeople[msg.sender].push(contributions[contributionID]);

    //     amountRised += msg.value;

    //     emit ContributionMade(contributions[contributionID]);

    //     if(amountRised >= fundingGoal){
    //         collected = true;

    //         if(amountRised >= fundingCap){
    //             // closeCampaign();
    //         }
    //     }

    //     return contributionID;
    // }

}