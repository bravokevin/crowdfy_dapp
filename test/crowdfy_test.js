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

            const destructuredCampaign = destructCampaign(campaignStruct);

            expect(destructuredCampaign.campaignName).to.equal('My Campaign');
            expect(destructuredCampaign.fundingGoal).to.equal(1000000);
            expect(destructuredCampaign.fundingCap).to.equal(2000000);
            expect(destructuredCampaign.deadline).to.equal(2)
            expect(destructuredCampaign.beneficiary).to.equal(beneficiary);
            expect(destructuredCampaign.owner).to.equal(contractCreator);
            //lack for creation tiima
            expect(destructuredCampaign.minimumCollected).to.equal(false);
            expect(destructuredCampaign.state.valueOf()).to.equal(STATE.ongoing);
            expect(destructuredCampaign.amountRised).to.equal(0);

        });

        it("should contribute founds", async () => {

            let campaignStruct = await contract.newCampaign.call()

            const destructContribution = contribution => {
                const { sender, value, time } = contribution;

                return {
                    sender,
                    value: Number(value),
                    time
                }
            }


            let destructuredCampaign = destructCampaign(campaignStruct);
            expect(destructuredCampaign.amountRised).to.equal(0)

            await contract.contribute({
                value: 20000,
                from: accounts[1]
            });

            campaignStruct = await contract.newCampaign.call()
            destructuredCampaign = destructCampaign(campaignStruct)

            expect(destructuredCampaign.amountRised).to.equal(20000)

            const contributions = await contract.contributions.call(0);

            let contributionDestructured = destructContribution(contributions);
            expect(contributionDestructured.sender).to.equal(accounts[1]);
            expect(contributionDestructured.value).to.equal(20000);
            //     // let contributionID = await contract.contributionID.call();
            //     // expect(contributionID).to.equal(1);

            //     // let contributions = await contract.contributions.call(ContributionID);
            //     // console.log(contributions)

            //     // let contributor = sawait contract.contributionsByPeople.call();
        })

        it("should pass to minimumCollected and State = Succeded", async () => {

            await contract.contribute({
                value: 20000,
                from: accounts[1]
            });

            await contract.contribute({
                value: 500000,
                from: accounts[1]
            });

            await contract.contribute({
                value: 500000,
                from: accounts[1]
            });

            await contract.contribute({
                value: 500000,
                from: accounts[1]
            });

            await contract.contribute({
                value: 500000,
                from: accounts[1]
            });

            let campaignStruct = await contract.newCampaign.call()

            let campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.amountRised).to.equal(2020000)
            expect(campaignDestructured.minimumCollected).to.equal(true)
            expect(campaignDestructured.state).to.equal(STATE.succed)
        })
})