module.exports = async function suite() {
    it('should pass to state = succeded', async () => {

        await contract.contribute(
            {
                from: contributor1,
                value: ONE_ETH
            });


        let campaignStruct = await contract.theCampaign.call()

        let campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(ONE_ETH)
        expect(campaignDestructured.minimumCollected).to.equal(true)
        expect(campaignDestructured.state).to.equal(STATE.succed)
    })

    it('should pass to failed state', async () => {

        let campaignStruct;
        let campaignDestructured;
        let amount = 250000000000000000;

        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });
        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });
        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });

        contract.setDate({ from: userCampaignCreator });
        try {
            await contract.contribute(
                {
                    from: contributor1,
                    value: amount
                });
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Not Permited during this state of the campaign");
        }
        try {
            await contract.withdraw({from: beneficiary})
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Not Permited during this state of the campaign");
        }

        campaignStruct = await contract.theCampaign.call()
        campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(750000000000000000)
        // expect(campaignDestructured.state).to.equal(STATE.failed)
    })

    it('should keep in ongoing state', async () => {
        let campaignStruct;
        let campaignDestructured;
        let amount = 250000000000000000;


        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });


        campaignStruct = await contract.theCampaign.call()
        campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(amount)
        expect(campaignDestructured.state).to.equal(STATE.ongoing)
        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });


        campaignStruct = await contract.theCampaign.call()
        campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(amount + amount)
        expect(campaignDestructured.state).to.equal(STATE.ongoing)
        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });

        campaignStruct = await contract.theCampaign.call()
        campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(amount + amount + amount)
        expect(campaignDestructured.state).to.equal(STATE.ongoing)
        await contract.contribute(
            {
                from: contributor1,
                value: amount
            });

        campaignStruct = await contract.theCampaign.call()
        campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(ONE_ETH)
        expect(campaignDestructured.state).to.equal(STATE.succed)


    })
} 