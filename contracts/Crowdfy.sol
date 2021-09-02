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
        Finalized,
        EarlySuccess
    }

    //** **************** EVENTS ********************** */

    event ContributionMade(Contribution _contributionMade); // fire when a contribution is made
    event MinimumReached(string); //fire when the campaign reached the minimum amoun to succced
    event BeneficiaryWitdraws(
        address _beneficiaryAddress,
        uint256 _amount
    ); //fire when the beneficiary withdraws found
    //fire when the contributor recive the founds if the campaign fails
    event ContributorRefounded(
        address _payoutDestination,
        uint256 _payoutAmount
    );
    event CampaignFinished(
        uint8 _state, 
        uint256 _timeOfFinalization, 
        uint256 _amountRised
    );
    event NewEarning(uint256 _earningMade);

    //** **************** STRUCTS ********************** */

    //Campaigns dataStructure
    struct Campaign {
        string campaignName;
        uint256 fundingGoal; //the minimum amount that the campaigns required
        uint256 fundingCap; //the maximum amount that the campaigns required
        uint256 deadline;
        address beneficiary; //the beneficiary of the campaign
        address owner; //the creator of the campaign
        uint256 created; // the time when the campaign was created
        State state; //the current state of the campaign
        uint256 amountRised; //the total amount that the campaign has been collected
    }

    //Contribution datastructure
    struct Contribution {
        address sender;
        uint256 value;
        uint256 time;
        uint256 numberOfContributions;
    }

    //** **************** STATE VARIABLES ********************** */
    bool private isInitialized = false;
    address private protocolOwner; //sets the owner of the protocol to make earnings

    //all the contribution made
    Contribution[] public contributions;
    // contributions made by people
    mapping(address => Contribution) public contributionsByPeople;

    uint256 public amountToWithdraw; // the amount that the bneficiary is able to withdraw
    uint256 public withdrawn = 0; // the current amount that the beneficiary has withdrawing
    //the actual campaign
    Campaign public theCampaign;

    //keeps track if a contributor has already been refunded
    mapping(address => bool) hasRefunded;
    //keeps track if a contributor has already been contributed
    mapping(address => bool) hasContributed;

    //** **************** MODIFIERS ********************** */

    modifier inState(State[2] memory _expectedState) {
        require(
            state() == uint8(_expectedState[0]) ||
                state() == uint8(_expectedState[1]),
            "Not Permited during this state of the campaign."
        );
        _;
    }

    //** **************** FUNCTIONS CODE ********************** */

    /**@notice allows users to contribute to the campaign, as the campaign is in the onoging state.
     */

    function contribute()
        external
        payable
        override
        inState([State.Ongoing, State.EarlySuccess])
    {
        require(msg.value > 0, "Put a correct amount");

        uint256 earning = getPercentage(msg.value);

        if (hasContributed[msg.sender]) {
            Contribution storage theContribution = contributionsByPeople[
                msg.sender
            ];
            theContribution.value += msg.value - earning;
            theContribution.numberOfContributions++;
            contributions.push(theContribution);
        } else {
            Contribution memory newContribution;
            contributionsByPeople[msg.sender] = newContribution = Contribution({
                sender: msg.sender,
                value: msg.value - earning,
                time: block.timestamp,
                numberOfContributions: 1
            });

            contributions.push(newContribution);
            hasContributed[msg.sender] = true;
        }

        theCampaign.amountRised += msg.value - earning;
        amountToWithdraw += msg.value - earning;
        //sends to the deployer of the protocol a earning of 1% for each contribution
        (bool success, ) = payable(protocolOwner).call{value: earning}("");
        require(success, "Failed to send Ether");

        emit NewEarning(earning);
        emit ContributionMade(contributionsByPeople[msg.sender]);

        if (theCampaign.amountRised >= theCampaign.fundingGoal) {
            theCampaign.state = State.EarlySuccess;
            emit MinimumReached("The minimum value has been reached");

            if (
                theCampaign.deadline > block.timestamp &&
                theCampaign.amountRised >= theCampaign.fundingCap
            ) 
            {
                theCampaign.state = State.Succeded;
            }
        }
    }

    /**@notice this function ITS ONLY for test porpuses
        this function has been removed during the deployment process
    */
    function setDate() external {
        theCampaign.deadline = 3;
        state();
    }

    /**@notice allows beneficiary to withdraw the founds of the campaign if this was succeded

    *@dev first stores the amount that the beneficiary is able to withdraw:
            amountToWithdraw(the amount that the campaign has been collected) 
            - 
            withdrawn(the amount that the beneficiary has withdrawing. starts at 0)
        this is store in "toWithdraw"

        second, add that amount "toWithdraw" the the quantity that the beneficiary has already withdrawing "withdrawn"

        third, substaract the amount that the beneficiary has withdrawn to the amount that the bneficiary is able to withdraw


    */
    function withdraw()
        external
        payable
        override
        inState([State.Succeded, State.EarlySuccess])
    {
        require(
            theCampaign.beneficiary == msg.sender,
            "Only the beneficiary can call this function"
        );
        uint256 toWithdraw;

        // prevents errors for underflow
        if(amountToWithdraw < withdrawn){
            toWithdraw = withdrawn - amountToWithdraw;
        }
        else{
            toWithdraw = amountToWithdraw - withdrawn;
        }
        // WARNING: posible error for overflow(but that would be is a lot of ether)
        withdrawn += amountToWithdraw;

        amountToWithdraw = 0;//prevents reentrancy

        (bool success, ) = payable(theCampaign.beneficiary).call{
            value: toWithdraw
        }("");
        require(success, "Failed to send Ether");

        emit BeneficiaryWitdraws(
            theCampaign.beneficiary,
            toWithdraw
        );

        //if the beneficiary has withdrawn an amount equal to the funding cap, finish the campaign
        if (withdrawn >= theCampaign.fundingCap) {
            theCampaign.state = State.Finalized;
            emit CampaignFinished(
                state(),
                block.timestamp,
                theCampaign.amountRised
            );
        }
    }

    /**@notice claim a refund if the campaign was failed and only if you are a contributor
    @dev this follows the withdraw pattern to prevent reentrancy
    */
    function claimFounds()
        external
        payable
        override
        inState([State.Failed, State.Failed])
    {
        require(hasContributed[msg.sender], "You didnt contributed");
        require(!hasRefunded[msg.sender], "You already has been refunded");
        uint256 toWithdraw = contributionsByPeople[msg.sender].value;
        contributionsByPeople[msg.sender].value = 0;
        (bool success, ) = payable(msg.sender).call{value: toWithdraw}("");
        require(success, "Failed to send Ether");
        hasRefunded[msg.sender] = true;
        emit ContributorRefounded(msg.sender, toWithdraw);
    }

    /**@notice creates a new instance campaign
        @dev use CREATE in the factory contract 
        REQUIREMENTS:
            due date must be major than the current block time

            campaign cannot be initialized from iniside or cannot be initialized more than once a particular campaign
     */
    function initializeCampaign(
        string calldata _campaignName,
        uint256 _fundingGoal,
        uint256 _deadline,
        uint256 _fundingCap,
        address _beneficiaryAddress,
        address _campaignCreator,
        address _protocolOwner
    ) external override {
        require(
            _deadline > block.timestamp,
            "Your duedate have to be major than the current time"
        );
        assert(!isInitialized);

        theCampaign = Campaign({
            campaignName: _campaignName,
            fundingGoal: etherToWei(_fundingGoal),
            fundingCap: etherToWei(_fundingCap),
            deadline: _deadline,
            beneficiary: _beneficiaryAddress,
            owner: _campaignCreator,
            created: block.timestamp,
            state: State.Ongoing,
            amountRised: 0
        });

        protocolOwner = _protocolOwner;
        isInitialized = true;
    }

    /**@notice evaluates the current state of the campaign, its used for the "inState" modifier
    
    @dev 
    */
    function state() private view returns (uint8 _state) {
        if (
            theCampaign.deadline > block.timestamp &&
            theCampaign.amountRised < theCampaign.fundingGoal &&
            withdrawn == 0
        ) {
            return uint8(State.Ongoing);
        } 
        else if (theCampaign.amountRised >= theCampaign.fundingGoal && 
                theCampaign.amountRised < theCampaign.fundingCap) { //otro and aqui revisando la duedate. o con un nested if 
            return uint8(State.EarlySuccess);
        } 
        else if (theCampaign.amountRised >= theCampaign.fundingCap && 
        withdrawn < theCampaign.fundingCap) {

            return uint8(State.Succeded);
        } 
        else if (theCampaign.amountRised >= theCampaign.fundingCap && 
        withdrawn >= theCampaign.fundingCap) {
            return uint8(State.Finalized);
        }
        else if (
            theCampaign.deadline < block.timestamp &&
            theCampaign.amountRised < theCampaign.fundingGoal
        ) {
            return uint8(State.Failed);
        }
    }

    /**@notice use to get a revenue of 1% for each contribution made */
    function getPercentage(uint256 num) private pure returns (uint256) {
        return (num * 1) / 100;
    }

    function etherToWei(uint256 _sumInEth) private pure returns (uint256) {
        return _sumInEth * 1 ether;
    }
}
