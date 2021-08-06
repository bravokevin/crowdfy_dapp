const CrowdfyContract = artifacts.require('./Crowdfy.sol');
const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');

const Contributions = require('./crowdfy/contributions.js');
const withdraw = require('./crowdfy/withdraw.js');
const state = require('./crowdfy/state.js');
const refound = require('./crowdfy/refound.js');

contract('Crowdfy', (accounts) => {
    let contractFactory;
    let contract;
    const userCampaignCreator = accounts[0];
    const contractImplementationCreator = accounts[1];
    const beneficiary = accounts[2];
    const contributor1 = accounts[3];
    const contributor2 = accounts[4];


    const STATE = {
        ongoing: 0,
        failed: 1,
        succed: 2,
        paidOut: 3
    };

    const CREATION_TIME = 1686614159;
    const ONE_ETH = 1000000000000000000;

    const destructContribution = contribution =>{
        const {value, time, numberOfContributions, hasContribute} = contribution;

        return{
        value: Number(value),
        time,
        numberOfContributions: Number(numberOfContributions),
        hasContribute
        }
    };


//allows us to destruct the campaign struct
    const destructCampaign = (struct) => {
        const { campaignName, fundingGoal, fundingCap, deadline, beneficiary, owner, created, minimumCollected, state, amountRised } = struct;

        return {
            campaignName,
            fundingGoal: Number(fundingGoal),
            fundingCap: Number(fundingCap),
            deadline: Number(deadline),
            beneficiary,
            owner,
            created: Number(created),
            minimumCollected,
            state: Number(state),
            amountRised: Number(amountRised)
        }
    };


    beforeEach(async () => {

        contractFactory = await CrowdfyFabricContract.new(
            {
                from: contractImplementationCreator
            }
        )

        await contractFactory.createCampaign(
            "My Campaign",
            1,
            CREATION_TIME,
            1,
            beneficiary,
            "IPFSHash",
            { from: userCampaignCreator }
        );

        contract = await CrowdfyContract.at(await contractFactory.campaignsById(0));

    })

    it("contract should be initialized correctly", async () => {
        const campaignStruct = await contract.theCampaign.call()

        const destructuredCampaign = destructCampaign(campaignStruct);
        expect(destructuredCampaign.campaignName).to.equal('My Campaign');
        expect(destructuredCampaign.fundingGoal).to.equal(ONE_ETH);
        expect(destructuredCampaign.fundingCap).to.equal(ONE_ETH);
        expect(destructuredCampaign.deadline).to.equal(CREATION_TIME)
        expect(destructuredCampaign.beneficiary).to.equal(beneficiary);
        expect(destructuredCampaign.owner).to.equal(userCampaignCreator);
        expect(destructuredCampaign.minimumCollected).to.equal(false);
        expect(destructuredCampaign.state.valueOf()).to.equal(STATE.ongoing);
        expect(destructuredCampaign.amountRised).to.equal(0);

    });

    describe('contributions', Contributions.bind(this));
    describe('State', state.bind(this))
    describe('Withdraw', withdraw.bind(this));
    describe('Refunding', refound.bind(this))

})