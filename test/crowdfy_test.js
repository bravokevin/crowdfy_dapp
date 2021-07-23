const CrowdfyContract = artifacts.require('./Crowdfy.sol');
const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');


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
        paidOut: 3,
    };

    const CREATION_TIME = 1686614159;
    const ONE_ETH = 1000000000000000000;

    //     //allows us to destruct the campaign struct
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

    //allows us to destruct the contribution struct
    const destructContribution = contribution => {
        const { sender, value, time } = contribution;

        return {
            sender,
            value: Number(value),
            time
        }
    }

    beforeEach(async () => {

        contractFactory = await CrowdfyFabricContract.new(
            {
                from: contractImplementationCreator
            }
        )

        await contractFactory.createCampaign("My Campaign",
            1,
            CREATION_TIME,
            1,
            beneficiary,
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

    describe('contributions', async () => {

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
            contract.setDate({ from: userCampaignCreator });

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
    })

    describe('State', async () => {
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

            await contract.contribute(
                {
                    from: contributor1,
                    value: amount
                });
            // try {
            //     await contract.contribute(
            //         {
            //             from: contributor1,
            //             value: amount
            //         });
            //     expect.fail()
            // }
            // catch (error) {
            //     expect(error.reason).to.equal("Not Permited during this state of the campaign");
            // }
            campaignStruct = await contract.theCampaign.call()
            campaignDestructured = destructCampaign(campaignStruct);

            expect(campaignDestructured.amountRised).to.equal(750000000000000000)
            expect(campaignDestructured.state).to.equal(STATE.failed)
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
    })

    describe('Withdraw', async () => {
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

            expect(balanceFinal - balanceinicial + (tx.gasPrice * txInfo.receipt.gasUsed)).to.equal(ONE_ETH)
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

            contract.setDate({ from: userCampaignCreator });

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

    })

    // describe.only('Refunding', async () => {
    //     it('should allow contributes to refound', async () => {

    //         let inicialBalance1 = await web3.eth.getBalance(contributor1)
    //         let inicialBalance2 = await web3.eth.getBalance(contributor2)

    //         await contract.contribute(20000,
    //             { from: contributor1 });


    //         await contract.contribute(20000,
    //             { from: contributor2 });
    //         contract.setDate({ from: userCampaignCreator });

    //         await contract.claimFounds({ from: contributor1 })
    //         await contract.claimFounds({ from: contributor2 })

    //         let FinalBalance1 = await web3.eth.getBalance(contributor1)
    //         let FinalBalance2 = await web3.eth.getBalance(contributor2)
    //         expect(FinalBalance1 - inicialBalance1).to.equal(20000)
    //         expect(FinalBalance2 - inicialBalance2).to.equal(20000)

    //     })


    //     it('should not allowed others to refund', async () => {
    //         await contract.contribute(20000,
    //             { from: contributor1 });


    //         await contract.contribute(20000,
    //             { from: contributor2 });
    //         contract.setDate({ from: userCampaignCreator });

    //         try {

    //             await contract.claimFounds({ from: beneficiary })
    //             expect.fail()

    //         }
    //         catch (error) {
    //             expect(error.reason).to.equal('You didnt contributed')
    //         }
    //     })

    //     it('should not allowed to refound twice', async () => {
    //         await contract.contribute(20000,
    //             { from: contributor1 });
    //         contract.setDate({ from: userCampaignCreator });

    //         await contract.claimFounds({ from: contributor1 })

    //         try {
    //             await contract.claimFounds({ from: contributor1 })
    //             expect.fail()

    //         }
    //         catch (ee) {

    //         }

    //     })
    // })

})