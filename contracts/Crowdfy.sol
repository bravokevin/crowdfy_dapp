pragma solidity ^8.0.0;

contract Crowdfy{

    enum State {
        Ongoing,
        Failed, 
        Succeded,
        PaidOut,
        Cancelled
    }

    struct Campaign {
        string campaignName;
        address beneficiary;
        uint targetAmount;
        uint totalCollected;
        uint deadline;
        bool collected;
        State state;
    }
    //see options to storage the campagins.

    Campaign[] public campaigns;

    mapping(address => uint) hasContributed;
    mapping (address => bool) hasCampaign;

    //the contributor gives the beneficiary the oportunity to take their founds, even if the campaign failled. Does not aply if the campaign is cancelled
    mapping(address => bool) canTakeFounds;

    event CampaignStarted(string campaignName, address addr, uint targetAmount, uint deadline);
    event CampaignFinished(address addr, uint totalCollected, bool suceeded);

    ///@dev: create a new campaign, only one account per active campaing. Once started they cannot update this parameters
    function createCampaign(string memory _campaignName, uint _targetAmount, uint _deadline) public {
        require(!hasCampaign, "Only one campaign per account");
        campaigns.push(Campaign(_campaignName, msg.sender, _targetAmount, 0, _deadline, false, State.Ongoing));
        emit CampaignStarted(_campaignName, msg.sender, _targetAmount, _deadline);
        hasCampaign[msg.sender] = true;
    }

    function contribute(bool _giveFounds)public payable {
        require(!collected, "The campaign was finished");
        totalCollected += msg.value;
        hasContributed[msg.sender] = msg.value;
        
        canTakeFounds[msg.sender] = _giveFounds;

        if(totalCollected >= targetAmount){
            _closeCampaign();
        }
    }

    //SEE IF THIS CAN BE IN SEPARATE FUNCTIONS.
    //close the campaign once collected, failure or canceled
    function _closeCampaign() private {
    }

    // to give all the fonds collected to the beneficiary
    function _withdraw() internal {

    }



}