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
    event ContributionMade (Contribution _contributionMade);
    event MinimumReached (string);

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

    Contribution[] public contributions;
    mapping(address => Contribution) contributionsByPeople;


    Campaign public newCampaign;

   

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

     /** MODIFIERS  */
    modifier inState(State _expectedState){
        require(newCampaign.state == _expectedState, "This function is not permited in this state of the campaign");
        _;
    }
    
    ///@notice allows users to contribute to the campaign, as the campaign is in the onoging state. Sets collected to true if the minimum amount is reached,emmit an event to let know to the user.
    function contribute() external payable inState(State.Ongoing){

        require(msg.value > 0, "Put A correct amount");

        newCampaign.amountRised += msg.value;

        Contribution memory newContribution = Contribution({sender: tx.origin, value: msg.value, time: block.timestamp});

        contributions.push(newContribution);

        emit ContributionMade(newContribution);

        if(newCampaign.amountRised >= newCampaign.fundingGoal){
            newCampaign.collected = true;
            emit MinimumReached("The minimum value has reached");
        }
    }





    // function contribute() public payable inState(State.Ongoing) /**returns(uint256 _contributionID)*/{

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
    //     return contributionID;
    // }

}