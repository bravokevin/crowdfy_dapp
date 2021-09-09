
# Crowdfy Protocol

A fully descentralized crowdfunding application.

This repository contains the core smart contracts for the Crowdfy V1 Protocol

### Deployed in Ropsten Test Network

        0xFbaca9b7286030B69EC35a7794e742106866A6Ff

## Running Tests

To run tests, run the following command

```bash
  truffle test
```
### Test Made
    Contract: CrowdfyFabric
    √ should create a campaign instance correctly (8315ms)
    √ should not crete campaigns were due date is minor than the current time (13990ms)

    Contract: Crowdfy
    √ contract should be initialized correctly (998ms)
    √ should not allowed to initialize the campaign from inside (8072ms)
    
        Contributions
        √ should contribute founds (2328ms)
        √ should not allowed to contribute 0 <  (672ms)
        √ should not contribute during succes state (2504ms)
        √ should not contribute after deadline (1160ms)
        √ should have multiple contrubitions (6475ms)

        State
        √ should pass to state = succeded (1631ms)
        √ should pass to failed state (6596ms)
        √ should keep in ongoing state (6635ms)

        Withdraw
        √ should allow the beneficiary withdraw during succes state
        √ should not allowed the beneficiary withdraw during ongoing state of the campaign (1922ms)
        √ should not allow the beneficiary withdraw during fail state (3260ms)
        √ should not allow others to withdraw (5658ms)

        Refunding
        √ should allow contributors to refound in case of failure (5678ms)
        √ should not allowed others to refund (4551ms)
        √ should not allowed to refound twice (5759ms)

        Earnings
        √ should have earnings for one contribution (1660ms)
        √ should have earnings for multiple contributions (5024ms)
        √ should support high amounts of earnings (1356ms)
        √ should support low amounts of earnings (1281ms)
        
        others
        √ should pass to earlySucess state (1665ms)
        √ should not pass to state falied once the earlySuccess has achived (2289ms)
        √ should allow the beneficiary withdraw during earlySuccess (5276ms)
        √ should allow contribution during earlysucces state (4298ms)
        √ should allow beneficiary withdraw money multiple during early state (10359ms)
        √ should pass to state finalized (7045ms)
        √ should not  be able to interact with the campaign once is finished (6752ms)
        √ should pass to state succed once 4 weeks has passed when the campaign is in state earlysuccess (3631ms)

## Usage/Examples

### CrowdfyFabric
```solidity
    function createCampaign(
        string calldata _campaignName, 
        uint _fundingGoal, 
        uint _deadline, 
        uint _fundingCap, 
        address _beneficiaryAddress
    ) external returns(uint256);
}
```
Creates a new Instance of the campaign (Using a [minimal Proxy Pattern](https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/))

### Crowdfy
```solidity
     function contribute() external payable;
```
Allows users to make contributions
```solidity
     function withdraw() external payable;
```
Allows the beneficiary to withdraw once the earlyState or SuccedState was reached
```solidity
     function claimFounds () external payable;
```
Allows contributors to get a refound if the campaign fails
```solidity
     function initializeCampaign
    (
        string calldata _campaignName,
        uint _fundingGoal,
        uint _deadline,
        uint _fundingCap,
        address _beneficiaryAddress,
        address _campaignCreator,
        address _protocolOwner
    ) external;
```
Creates new instance of the campaign
## Site
You can acces to the site 

Infura gateway --> bafybeihltint57646pxzyct3ficevuknzebu5f5nxiqx3mgrxmvuce6jeu.ipfs.infura-ipfs.io

IPFS gateway --> bafybeihltint57646pxzyct3ficevuknzebu5f5nxiqx3mgrxmvuce6jeu.ipfs.dweb.link

#### Actual IPFS hash

        QmeCLozXKTdKKePNDoQkE1dtL5nwEeLVaqCKFSNNvNmscY
