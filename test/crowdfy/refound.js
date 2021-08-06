module.exports = async function suite() {
    it('should allow contributors to refound in case of failure', async () => {

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

        await contract.setDate({ from: userCampaignCreator });
        const balance1Inicial = await web3.eth.getBalance(contributor1)
        const balance2Inicial = await web3.eth.getBalance(contributor2)

        let txInfo1 = await contract.claimFounds({ from: contributor1 })
        let txInfo2 = await contract.claimFounds({ from: contributor2 })

        const tx1 = await web3.eth.getTransaction(txInfo1.tx);
        const tx2 = await web3.eth.getTransaction(txInfo2.tx);

        const balance1Final = await web3.eth.getBalance(contributor1)
        const balance2Final = await web3.eth.getBalance(contributor2)

        //NOTICE = idk where those 6144 and 16384 come from
        expect(
            (balance1Final - balance1Inicial) + (tx1.gasPrice * txInfo1.receipt.gasUsed)
            ).to.equal(500000000000000000 + 16384 - 6144)
        
        expect(
            (balance2Final - balance2Inicial) + (tx2.gasPrice * txInfo2.receipt.gasUsed)
            ).to.equal(250000000000000000 + 16384 - 6144)
        })

        it('should not allowed others to refund', async () => {

            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH / 3
                });


                await contract.contribute(
                    {
                        from: contributor2,
                        value: ONE_ETH / 3
                    });
            await contract.setDate({ from: userCampaignCreator });

            try {
                await contract.claimFounds({ from: beneficiary })
                expect.fail()

            }
            catch (error) {
                expect(error.reason).to.equal('You didnt contributed')
            }
            try {
                await contract.claimFounds({ from: accounts[6] })
                expect.fail()

            }
            catch (error) {
                expect(error.reason).to.equal('You didnt contributed')
            }

        })

        it('should not allowed to refound twice', async () => {
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH / 3
                });
            await contract.contribute(
                {
                    from: contributor1,
                    value: ONE_ETH / 3
                });
                
            contract.setDate({ from: userCampaignCreator });
            await contract.claimFounds({ from: contributor1 })
            try {
            await contract.claimFounds({ from: contributor1 })
                expect.fail()
            }
            catch (error) {
                expect(error.reason).to.equal("You already has been refunded")
            }
        })
}
