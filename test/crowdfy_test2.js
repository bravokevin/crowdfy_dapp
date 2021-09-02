const CrowdfyContract = artifacts.require('./Crowdfy.sol');
const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');


contract('Crowdfy2', (accounts) => {
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
        paidOut: 3,
        earlySuccess: 4
    };

    const CREATION_TIME = 1686614159;
    const ONE_ETH = 1000000000000000000;
    const ERR_MSG = "Not Permited during this state of the campaign."

    //     //allows us to destruct the campaign struct
    const destructCampaign = (struct) => {
        const { campaignName, fundingGoal, fundingCap, deadline, beneficiary, owner, created, state, amountRised } = struct;

        return {
            campaignName,
            fundingGoal: Number(fundingGoal),
            fundingCap: Number(fundingCap),
            deadline: Number(deadline),
            beneficiary,
            owner,
            created: Number(created),
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
            2,
            beneficiary,
            { from: userCampaignCreator }
        );

        contract = await CrowdfyContract.at(await contractFactory.campaignsById(0));

    })
    describe('others', async () => {


        it("should pass to earlySucess state", async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            let campaignStruct = await contract.theCampaign.call()
            let amountAllowedToWIthdraw = await contract.amountToWithdraw.call()

            let campaignDestructured = destructCampaign(campaignStruct);
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.amountRised).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)

        })
        it('should not pass to state falied once the earlySuccess has achived', async () => {

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            await contract.setDate({ from: userCampaignCreator });

            let campaignStruct = await contract.theCampaign.call()
            let amountAllowedToWIthdraw = await contract.amountToWithdraw.call()

            let campaignDestructured = destructCampaign(campaignStruct);
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.amountRised).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)
        })

        it("should allow the beneficiary withdraw during earlySuccess", async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            let amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            let amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal(0)
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))

            let campaignStruct = await contract.theCampaign.call()

            let campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.amountRised).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)

            await contract.withdraw({ from: beneficiary });

            amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(Number(amountAllowedToWIthdraw)).to.equal(0)


        })

        it("should allow contribution during earlysucces state", async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            let campaignStruct = await contract.theCampaign.call()
            let amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            let campaignDestructured = destructCampaign(campaignStruct);
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.amountRised).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            campaignStruct = await contract.theCampaign.call()

            campaignDestructured = destructCampaign(campaignStruct);
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))

            expect(campaignDestructured.amountRised).to.equal(((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2))) - ((1 / 100) * ((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2)))))

            expect(campaignDestructured.state).to.equal(STATE.succed)
        })

        it("should allow beneficiary withdraw money multiple during early state", async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            let amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            let amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal(0)
            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))

            let campaignStruct = await contract.theCampaign.call()

            campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)

            await contract.withdraw({ from: beneficiary });

            amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))
            expect(Number(amountAllowedToWIthdraw)).to.equal(0)

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))

            expect(Number(amountAllowedToWIthdraw)).to.equal((ONE_ETH + (ONE_ETH / 2)) - ((1 / 100) * (ONE_ETH + (ONE_ETH / 2))))

            await contract.withdraw({ from: beneficiary })

            amountAllowedToWIthdraw = await contract.amountToWithdraw.call()
            amountBeneficiaryWithdrawn = await contract.withdrawn.call()

            expect(Number(amountBeneficiaryWithdrawn)).to.equal(((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2))) - ((1 / 100) * ((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2)))))

            expect(Number(amountAllowedToWIthdraw)).to.equal(0)

            campaignStruct = await contract.theCampaign.call()

            campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.amountRised).to.equal(((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2))) - ((1 / 100) * ((ONE_ETH + (ONE_ETH / 2)) + (ONE_ETH + (ONE_ETH / 2)))))
            expect(campaignDestructured.state).to.equal(STATE.paidOut)
        })

        it('should pass to state finalized', async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });

            let campaignStruct = await contract.theCampaign.call()

            let campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.state).to.equal(STATE.earlySuccess)

            await contract.withdraw({ from: beneficiary });

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + (ONE_ETH / 2)
                });
            campaignStruct = await contract.theCampaign.call()

            campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.state).to.equal(STATE.succed)

            await contract.withdraw({ from: beneficiary });
            campaignStruct = await contract.theCampaign.call()

            campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.state).to.equal(STATE.paidOut)
        })

        it('should not  be able to interact with the campaign once is finished', async () => {

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH + ONE_ETH + (ONE_ETH / 2)
                });
            await contract.withdraw({ from: beneficiary });

            let campaignStruct = await contract.theCampaign.call()

            let campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.state).to.equal(STATE.paidOut)

            try {
                await contract.contribute(
                    {
                        from: contributor1,
                        value: ONE_ETH + (ONE_ETH / 2)
                    });
                expect.fail()
            }
            catch (err) {
                expect(err.reason).to.equal("Not Permited during this state of the campaign.")
            }
            try {
                await contract.withdraw({ from: beneficiary });
                expect.fail()
            }
            catch (err) {
                expect(err.reason).to.equal("Not Permited during this state of the campaign.")
            }
            try {
                await contract.claimFounds({ from: contributor1 });
                expect.fail()
            }
            catch (err) {
                expect(err.reason).to.equal("Not Permited during this state of the campaign.")
            }
        })

    })
})