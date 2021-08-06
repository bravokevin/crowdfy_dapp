module.exports = async function suite() {

    it("should contribute founds", async () => {

        let campaignStruct = await contract.theCampaign.call()
        
        let destructuredCampaign = destructCampaign(campaignStruct);
        
        expect(destructuredCampaign.amountRised).to.equal(0)
        
        await contract.contribute(
        {
            from: contributor1,
            value: ONE_ETH - 200000000
        });

    campaignStruct = await contract.theCampaign.call()
    destructuredCampaign = destructCampaign(campaignStruct)
    expect(destructuredCampaign.amountRised).to.equal(ONE_ETH - 200000000)
    const contributions = await contract.contributions.call(0);
    let contributionDestructured = destructContribution(contributions);
    expect(contributionDestructured.sender).to.equal(contributor1);
    expect(contributionDestructured.value).to.equal(ONE_ETH - 200000000);
    expect(contributionDestructured.numberOfContributions).to.equal(1);


})

it('should not allowed to contribute 0 < ', async () => {
    try {
        await contract.contribute(
            {
                from: contributor1,
                value: 0
            });
        expect.fail()
    }
    catch (error) {
        expect(error.reason).to.equal("Put a correct amount");
    }
})

it("should not contribute during succes state", async () => {

    await contract.contribute(
        {
            from: contributor1,
            value: ONE_ETH
        });

    let campaignStruct = await contract.theCampaign.call()

    let campaignDestructured = destructCampaign(campaignStruct);
    expect(campaignDestructured.state).to.equal(STATE.succed)

    try {
        await contract.contribute(
            {
                from: contributor1,
                value: ONE_ETH - 200000000
            });

        expect.fail()
    } catch (err) {

    }
})

it("should not contribute after deadline", async () => {
    await contract.setDate({ from: userCampaignCreator });

    try {
        await contract.contribute(
            {
                from: contributor1,
                value: ONE_ETH - 200000000
            });
        expect.fail()
    }
    catch (error) {
        expect(error.reason).to.equal("Not Permited during this state of the campaign");
    }
})
it('should have multiple contrubitions', async () =>{
    await contract.contribute(
        {
            from: contributor1,
            value: ONE_ETH / 4
        });

    await contract.contribute(
        {
        from: contributor1,
        value: ONE_ETH / 4
        });

    await contract.contribute(
        {
        from: contributor1,
        value: ONE_ETH / 4
        });
        
    await contract.contribute(
        {
        from: contributor2,
        value: ONE_ETH / 4
        });


    const contributions = await contract.contributionsByPeople.call(contributor1);
    let contributionDestructured = destructContribution(contributions);

    expect(contributionDestructured.sender).to.equal(contributor1);
    expect(contributionDestructured.value).to.equal(750000000000000000);
    expect(contributionDestructured.numberOfContributions).to.equal(3);

    //NOTICE we have to know the length of the array
    // expect(await contract.contributions.length).to.equal(4);
})
}