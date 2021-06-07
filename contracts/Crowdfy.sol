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
    event BeneficiaryWitdraws(string _message, address _beneficiaryAddress); //fire when the beneficiary withdraws found

    // event CampaignFinished(
    //     address addr,
    //     uint totalminimumCollected,
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
        bool minimumCollected; //to see if we minimumCollected the enough amount of foounds
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
            minimumCollected: false,
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
    
    ///@notice allows users to contribute to the campaign, as the campaign is in the onoging state. Sets minimumCollected to true if the minimum amount is reached,emmit an event to let know to the user.
    function contribute() external payable inState(State.Ongoing){

        require(msg.value > 0, "Put A correct amount");


        newCampaign.amountRised += msg.value;

        Contribution memory newContribution = Contribution({sender: tx.origin, value: msg.value, time: block.timestamp});

        contributions.push(newContribution);

        emit ContributionMade(newContribution);

        if(newCampaign.amountRised >= newCampaign.fundingCap){
            newCampaign.minimumCollected = true;
            emit MinimumReached("The minimum value has reached");
            if((newCampaign.deadline < block.timestamp 
                 && newCampaign.amountRised >= newCampaign.fundingGoal)
                 || newCampaign.amountRised >= newCampaign.fundingCap)
                {
                newCampaign.state = State.Succeded;
                }
        }
    }


    ///@notice evaluates the current state of the campaign, its used for the "inState" modifier
    function state() private view returns(uint8 _state) {

        if(newCampaign.deadline > block.timestamp 
        && newCampaign.minimumCollected == false
        && newCampaign.amountRised < newCampaign.fundingCap)
        {
            return uint8(State.Ongoing);
        }   

        else if((newCampaign.deadline < block.timestamp 
        && newCampaign.amountRised >= newCampaign.fundingGoal)
        || newCampaign.amountRised >= newCampaign.fundingCap)
        {
            return uint8(State.Succeded);
        }

        else if(block.timestamp > newCampaign.deadline 
        && newCampaign.minimumCollected == false 
        && newCampaign.amountRised < newCampaign.fundingGoal)
        {
            return uint8(State.Failed);
        }
    }

    ///@notice this function ITS ONLY for test porpuses
    function setDate() external {
        newCampaign.deadline = 3;

    }

    ///@notice allows beneficiary to withdraw the founds of the campaign if this was succeded
    function withdraw() external payable inState(State.Succeded){
        require(newCampaign.beneficiary == tx.origin, "Only the beneficiary can call this function");

        payable(newCampaign.beneficiary).transfer(address(this).balance);

        newCampaign.amountRised = address(this).balance;

        emit BeneficiaryWitdraws("The beneficiary has withdraw the founds", newCampaign.beneficiary);
    }
}