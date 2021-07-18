const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');

contract('CrowdfyFabric', accounts => {

    let contract;
    let contractImplementationCreator = accounts[0];
    let userCampaignCreator = accounts[1];
    let beneficiary = accounts[2];

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
        }
    };

    const CREATION_TIME = 1623135770000;
    
    before(async () => {
        contract = await CrowdfyFabricContract.new(
            {
                from: contractImplementationCreator
            }
        )
    })

    it("should create a campaign instance correctly", async () =>{
        const campaignContract = await contract.createCampaign("My Campaign",
        1000000,
        CREATION_TIME,
        2000000,
        beneficiary, {from: userCampaignCreator});

        const  campaignLength = await contract.getCampaignsLength.call();
        expect(Number(campaignLength)).to.equal(1)

        const campaignByUserStruct = await contract.getCampaignByUser.call(userCampaignCreator)

        const destructuredCampaign = destructCampaign(campaignByUserStruct);

        expect(destructuredCampaign.campaignName).to.equal('My Campaign');
        expect(destructuredCampaign.fundingGoal).to.equal(1000000);
        expect(destructuredCampaign.fundingCap).to.equal(2000000);
        expect(destructuredCampaign.deadline).to.equal(CREATION_TIME)
        expect(destructuredCampaign.beneficiary).to.equal(beneficiary);
        expect(destructuredCampaign.owner).to.equal(userCampaignCreator);
    })

    it('should not crete campaigns were due date is minor than the current time', async () =>{
        try{
            await contract.createCampaign("My Campaign",
            1000000,
            1626472796,
            2000000,
            beneficiary, {from: userCampaignCreator});

        expect.fail()
        }
        catch(err){
            expect(err.reason).to.equal('Your duedate have to be major than the current time');
        }
    })
})