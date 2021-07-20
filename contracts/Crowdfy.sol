//SPDX-License-Identifier: UNLICENSED;
pragma solidity ^0.8.0;

import "./CrowdfyI.sol";

///@title crowdfy crowdfunding contract
contract Crowdfy is CrowdfyI {
    
    //** **************** ENUMS ********************** */

    //The posible states of the campaign
    enum State {
        Ongoing,
        Failed,
        Succeded,
        Finalized
    }

    //** **************** EVENTS ********************** */

    event ContributionMade (Contribution _contributionMade); // fire when a contribution is made
    event MinimumReached (string); //fire when the campaign reached the minimum amoun to succced
    event BeneficiaryWitdraws(string _message, address _beneficiaryAddress); //fire when the beneficiary withdraws found
    //fire when the contributor recive the founds if the campaign fails
    event ContributorRefounded(address _payoutDestination, uint256 _payoutAmount); 
    event CampaignFinished(string _message, uint256 _timeOfFinalization);
    event CampaignStateChange(State _currentState);

    //** **************** STRUCTS ********************** */

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

    //** **************** STATE VARIABLES ********************** */

    //all the contribution made
    Contribution[] public contributions;
    // contributions made by people
    mapping(address => Contribution[]) public contributionsByPeople;

    Campaign public theCampaign;

    //** **************** MODIFIERS ********************** */

    modifier inState(State _expectedState){
        require(state() == uint8(_expectedState), "Not Permited during this state of the campaign");
        _;
    }
    
    //** **************** FUNCTIONS CODE ********************** */


    /**@notice allows users to contribute to the campaign, as the campaign is in the onoging state.
     Sets minimumCollected to true if the minimum amount is reached.
     emmit ContributionMaden event.*/

    function contribute(uint256 _contributionValue) external payable inState(State.Ongoing){

        require(_contributionValue > 0, "Put a correct amount");
            
        Contribution memory newContribution = Contribution(
            {
                sender: msg.sender, 
                value: _contributionValue, 
                time: block.timestamp
            });

        contributions.push(newContribution);

        contributionsByPeople[msg.sender].push(newContribution);

        theCampaign.amountRised += _contributionValue;

        emit ContributionMade(newContribution);

        if(theCampaign.amountRised >= theCampaign.fundingGoal){
            theCampaign.minimumCollected = true;

            emit MinimumReached("The minimum value has been reached");

            if((theCampaign.deadline < block.timestamp 
                 && theCampaign.amountRised >= theCampaign.fundingCap)
                 || theCampaign.amountRised >= theCampaign.fundingCap)
                {
                theCampaign.state = State.Succeded;

                emit CampaignStateChange(State.Succeded);

                }
        }
    }
    

    /**@notice evaluates the current state of the campaign, its used for the "inState" modifier
    
    @dev 
    */
    function state() private view returns(uint8 _state) {

        if(theCampaign.deadline > block.timestamp 
        && theCampaign.minimumCollected == false
        && theCampaign.amountRised < theCampaign.fundingCap)
        {
            return uint8(State.Ongoing);
        }   

        else if(theCampaign.amountRised >= theCampaign.fundingGoal
        || theCampaign.amountRised >= theCampaign.fundingCap)
        {
            return uint8(State.Succeded);
        }

        else if(theCampaign.deadline < block.timestamp
        && theCampaign.minimumCollected == false 
        && theCampaign.amountRised < theCampaign.fundingGoal)
        {
            return uint8(State.Failed);
        }
    }

    ///@notice this function ITS ONLY for test porpuses
    function setDate() external {
        theCampaign.deadline = 3;

    }

    ///@notice allows beneficiary to withdraw the founds of the campaign if this was succeded
    function withdraw() external payable inState(State.Succeded){
        require(theCampaign.beneficiary == tx.origin, "Only the beneficiary can call this function");

        payable(theCampaign.beneficiary).transfer(theCampaign.amountRised);

        emit BeneficiaryWitdraws("The beneficiary has withdraw the founds", theCampaign.beneficiary);
        
        theCampaign.state = State.Finalized;

        emit CampaignFinished("The campaign was finished succesfull", block.timestamp);
    }


    ///@notice claim a refund if the campaign was failed and only if you are a contributor
    ///@dev this follows the withdraw pattern to prevent reentrancy
    function claimFounds () external payable inState(State.Failed) {
        uint256 allContributions = contributionsByPeople[msg.sender].length;
        require(allContributions > 0, 'You didnt contributed');
        
        uint256 contributionsIndex = allContributions - 1;
        uint256 amountToWithdraw;

        for(uint256 i = 0; i <= allContributions; i++){
            amountToWithdraw += contributionsByPeople[msg.sender][contributionsIndex].value;
            contributionsByPeople[msg.sender][contributionsIndex].value = 0;
            contributionsIndex--;
        }
        payable(msg.sender).transfer(amountToWithdraw);
        emit ContributorRefounded(msg.sender, amountToWithdraw);
        
    }


    /**@notice creates a new instance campaign
        @dev use CREATE in the factory contract 
        REQUIREMENTS:
            due date must be major than the current block time
     */
    function initializeCampaign
    (
        string memory _campaignName,
        uint _fundingGoal,
        uint _deadline,
        uint _fundingCap,
        address _beneficiaryAddress,
        address _campaignCreator
    ) external
    {
        require(_deadline > block.timestamp, "Your duedate have to be major than the current time");

        theCampaign = Campaign(
            {
            campaignName: _campaignName,
            fundingGoal: _fundingGoal,
            fundingCap: _fundingCap,
            deadline: _deadline,
            beneficiary: _beneficiaryAddress,
            owner: _campaignCreator,
            created: block.timestamp,
            minimumCollected: false,
            state: State.Ongoing,
            amountRised: 0
            });
    }
}

