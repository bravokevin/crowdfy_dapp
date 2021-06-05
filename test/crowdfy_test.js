const CrowdfyContract = artifacts.require('./Crowdfy');

contract('Crowdfy', (accounts) => {
    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[2];

    const STATE = {
        ongoing: 0,
        failed: 1,
        succed: 2,
        paidOut: 3,
    };

    beforeEach(async () => {
        contract = await CrowdfyContract.new("My Campaign",
            1000000,
            2,
            2000000,
            beneficiary,
            {
                from: contractCreator,
                gas: 2000000
            }
        )
    })

    it("contract should be initialized correctly", async () => {
        let campaignStruct = await contract.newCampaign.call()

        const destructStruct = (struct) =>{
            const {campaignName, fundingGoal, fundingCap, deadline, beneficiary, owner, created, collected,state, amountRised} = struct;
            
            return {campaignName, 
                    fundingGoal: Number(fundingGoal),
                    fundingCap: Number(fundingCap),
                    deadline: Number(deadline),
                    beneficiary, 
                    owner, 
                    created: Number(created),
                    collected,
                    state: Number(state),
                    amountRised: Number(amountRised)
                    }
        };

        const destructuredCampaign = destructStruct(campaignStruct);

        expect(destructuredCampaign.campaignName).to.equal('My Campaign');
        expect(destructuredCampaign.fundingGoal).to.equal(1000000);
        expect(destructuredCampaign.fundingCap).to.equal(2000000);
        expect(destructuredCampaign.deadline).to.equal(2)
        expect(destructuredCampaign.beneficiary).to.equal(beneficiary);
        expect(destructuredCampaign.owner).to.equal(contractCreator);
        //lack for creation tiima
        expect(destructuredCampaign.collected).to.equal(false);
        expect(destructuredCampaign.state.valueOf()).to.equal(STATE.ongoing);
        expect(destructuredCampaign.amountRised).to.equal(0);

    });

    // it("can contribute founds", async () => {

    //     await contract.contribute({
    //         value: 20000,
    //         from: accounts[1]
    //     });
    //     // let contributionID = await contract.contributionID.call();
    //     // expect(contributionID).to.equal(1);

    //     // let contributions = await contract.contributions.call(ContributionID);
    //     // console.log(contributions)

    //     // let amountRised = await contract.amountRised.call()
    //     // expect(amountRised).to.equal(200000);

    //     // let contributor = sawait contract.contributionsByPeople.call();
    // })
})