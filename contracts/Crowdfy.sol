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
    event ContributionMade (Contribution _contributionMade); // fire when a contribution is made
    event MinimumReached (string); //fire when the campaign reached the minimum amoun to succced
    event WithdrawToBeneficiary(string); //fire when the beneficiary withdraws found

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
        // require(_deadline >= block.timestamp, "Your duedate have to be major than the current time");
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
        require(state() == uint8(_expectedState), "This function is not permited in this state of the campaign");
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
            // newCampaign.state = State.Succeded;
        }
    }

    //the current state of the campaign
    function state() private view returns(uint8) {

        if(newCampaign.deadline < block.timestamp 
        && newCampaign.collected == false )
        {
            return uint8(State.Ongoing);
        }   

        else if(newCampaign.amountRised >= newCampaign.fundingCap 
        || block.timestamp >= newCampaign.deadline)
        {
            return uint8(State.Succeded);
        }

        else if(block.timestamp >= newCampaign.deadline 
        && newCampaign.collected == false 
        && newCampaign.amountRised < newCampaign.fundingGoal)
        {
            return uint8(State.Failed);
        }
    }

   
}