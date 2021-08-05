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
        uint256 fundingGoal;//the minimum amount that the campaigns required
        uint256 fundingCap; //the maximum amount that the campaigns required
        uint256 deadline;
        address beneficiary;//the beneficiary of the campaign
        address owner;//the creator of the campaign
        uint256 created; // the time when the campaign was created
        bool minimumCollected; //to see if we minimumCollected the enough amount of foounds
        State state; //the current state of the campaign
        uint256 amountRised;  
    }

    //Contribution datastructure
    struct Contribution {
        address sender;
        uint256 value;
        uint256 time;
        uint256 numberOfContributions;
    }

    //** **************** STATE VARIABLES ********************** */

    //all the contribution made
    Contribution[] public contributions;
    // contributions made by people
    mapping(address => Contribution) public contributionsByPeople;

    //the actual campaign
    Campaign public theCampaign;

    //keeps track if a contributor has already been refunded
    mapping(address => bool) hasRefunded;
    //keeps track if a contributor has already been contributed
    mapping(address => bool) hasContributed;

    //** **************** MODIFIERS ********************** */

    modifier inState(State _expectedState){
        require(state() == uint8(_expectedState), "Not Permited during this state of the campaign");
        _;
    }
    
    //** **************** FUNCTIONS CODE ********************** */


    /**@notice allows users to contribute to the campaign, as the campaign is in the onoging state.
     Sets minimumCollected to true if the minimum amount is reached.
     emmit ContributionMaden event.*/

    function contribute() external payable inState(State.Ongoing){
        require(msg.value > 0, "Put a correct amount"); 
        if(hasContributed[msg.sender]){
            Contribution storage theContribution = contributionsByPeople[msg.sender];
            theContribution.value += msg.value;
            theContribution.numberOfContributions++;
            contributions.push(theContribution);
        }
        else{
        Contribution memory newContribution; 
        contributionsByPeople[msg.sender] = newContribution = Contribution(
            {
                sender: msg.sender, 
                value: msg.value, 
                time: block.timestamp,
                numberOfContributions: 1
            });
            
        contributions.push(newContribution);
        hasContributed[msg.sender] = true;
        }

        theCampaign.amountRised += msg.value;
        emit ContributionMade(contributionsByPeople[msg.sender]);

        if(theCampaign.amountRised >= theCampaign.fundingGoal){
            theCampaign.minimumCollected = true;

            emit MinimumReached("The minimum value has been reached");

            if((theCampaign.deadline > block.timestamp 
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
        && theCampaign.amountRised < theCampaign.fundingCap)
        {
            return uint8(State.Ongoing);
        }   

        else if(theCampaign.amountRised >= theCampaign.fundingCap || 
        theCampaign.amountRised >= theCampaign.fundingGoal)
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
        state();
    }

    ///@notice allows beneficiary to withdraw the founds of the campaign if this was succeded
    function withdraw() external payable inState(State.Succeded){
        require(theCampaign.beneficiary == msg.sender, "Only the beneficiary can call this function");

        uint toWithdraw = theCampaign.amountRised;

        theCampaign.amountRised = 0;

        (bool success, ) = payable(theCampaign.beneficiary).call{value:toWithdraw}("");
        require(success, "Failed to send Ether");

        emit BeneficiaryWitdraws("The beneficiary has withdraw the founds", theCampaign.beneficiary);
        
        theCampaign.state = State.Finalized;

        emit CampaignFinished("The campaign was finished succesfull", block.timestamp);
    }


    /**@notice claim a refund if the campaign was failed and only if you are a contributor
    @dev this follows the withdraw pattern to prevent reentrancy
    the function use a for loop for iterate over all the contributions that a contributor made
    */
    function claimFounds () external payable inState(State.Failed) {
        require(hasContributed[msg.sender], 'You didnt contributed');
        require(!hasRefunded[msg.sender], "You already has been refunded");
        uint256 amountToWithdraw = contributionsByPeople[msg.sender].value;
        contributionsByPeople[msg.sender].value = 0;
        (bool success, ) = payable(msg.sender).call{value:amountToWithdraw}("");
        require(success, "Failed to send Ether");
        hasRefunded[msg.sender] = true;
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
            fundingGoal:  etherToWei(_fundingGoal),
            fundingCap: etherToWei(_fundingCap),
            deadline: _deadline,
            beneficiary:_beneficiaryAddress,
            owner: _campaignCreator,
            created: block.timestamp,
            minimumCollected: false,
            state: State.Ongoing,
            amountRised: 0
            });
    }

        function etherToWei(uint _sumInEth) private pure returns (uint){
        return _sumInEth * 1 ether;
    }
}

