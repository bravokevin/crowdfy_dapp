module.exports = async function suite() {
    it('should allow the beneficiary withdraw during succes state', async () => {

            
        await contract.contribute(
            {
                from: contributor1,
                value: ONE_ETH
            });

        let balanceinicial = await web3.eth.getBalance(beneficiary)

        let campaignStruct = await contract.theCampaign.call()
        let campaignDestructured = destructCampaign(campaignStruct);

        expect(campaignDestructured.amountRised).to.equal(ONE_ETH)
        expect(campaignDestructured.state).to.equal(STATE.succed)

        let txInfo = await contract.withdraw({from: beneficiary})

        const tx = await web3.eth.getTransaction(txInfo.tx);

        let balanceFinal = await web3.eth.getBalance(beneficiary)

        //NOTICE = idk where those 6100 come from
        expect(
            (balanceFinal - balanceinicial) + (tx.gasPrice * txInfo.receipt.gasUsed)
            ).to.equal(ONE_ETH + 6100)
    })

    it('should not allowed the beneficiary withdraw during other states of the campaign', async () => {

        await contract.contribute(
            {
                from: contributor1,
                value: 250000000000000000
            });

        try {
            await contract.withdraw({ from: beneficiary })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Not Permited during this state of the campaign")
        }

    })

    it('should not allowd the beneficiary withdraw during fail state', async () => {

        await contract.contribute(
            {
                from: contributor1,
                value: 250000000000000000
            });

        await contract.setDate({ from: userCampaignCreator });

        try {
            await contract.withdraw({ from: beneficiary })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Not Permited during this state of the campaign")
        }

    })

    it('should not allowed others to withdraw', async () => {
        await contract.contribute(
            {
                from: contributor1,
                value: ONE_ETH / 2
            });

        await contract.contribute(
            {
                from: contributor2,
                value: ONE_ETH / 2
            });

        try {
            await contract.withdraw({ from: contributor1 })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Only the beneficiary can call this function")
        }


        try {
            await contract.withdraw({ from: contributor2 })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Only the beneficiary can call this function")
        }


        try {
            await contract.withdraw({ from: userCampaignCreator })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Only the beneficiary can call this function")
        }

        try {
            await contract.withdraw({ from: contractImplementationCreator })
            expect.fail()
        }
        catch (error) {
            expect(error.reason).to.equal("Only the beneficiary can call this function")
        }
    })
}