const CrowdfyContract = artifacts.require('./Crowdfy.sol');
const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');


contract('Crowdfy', (accounts) => {
    let contractFactory;
    let contract;
    const userCampaignCreator = accounts[0];
    const contractImplementationCreator = accounts[1];
    const beneficiary = accounts[2];

    const STATE = {
        ongoing: 0,
        failed: 1,
        succed: 2,
        paidOut: 3,
    };

    const CREATION_TIME = 1686614159;
    

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

    before(async () => {
        contractFactory = await CrowdfyFabricContract.new(
            {
                from: contractImplementationCreator
            }
        )
    });

    beforeEach(async () =>{

        await contractFactory.createCampaign("My Campaign",
        1000000,
        CREATION_TIME,
        2000000,
        beneficiary,
        {from: userCampaignCreator}
        );

        
        contract = await CrowdfyContract.at( await contractFactory.campaignsById(0));


    })

        it("contract should be initialized correctly", async () => {

            
            const campaignStruct = await contract.theCampaign.call()

            const destructuredCampaign = destructCampaign(campaignStruct);
            expect(destructuredCampaign.campaignName).to.equal('My Campaign');
            expect(destructuredCampaign.fundingGoal).to.equal(1000000);
            expect(destructuredCampaign.fundingCap).to.equal(2000000);
            expect(destructuredCampaign.deadline).to.equal(CREATION_TIME)
            expect(destructuredCampaign.beneficiary).to.equal(beneficiary);
            expect(destructuredCampaign.owner).to.equal(userCampaignCreator);
            expect(destructuredCampaign.minimumCollected).to.equal(false);
            expect(destructuredCampaign.state.valueOf()).to.equal(STATE.ongoing);
            expect(destructuredCampaign.amountRised).to.equal(0);

        });

//         it("should contribute founds", async () => {

//             let campaignStruct = await contract.newCampaign.call()

//             let destructuredCampaign = destructCampaign(campaignStruct);

//             expect(destructuredCampaign.amountRised).to.equal(0)

//             await contract.contribute({
//                 value: 20000,
//                 from: accounts[1]
//             });

//             campaignStruct = await contract.newCampaign.call()
//             destructuredCampaign = destructCampaign(campaignStruct)

//             expect(destructuredCampaign.amountRised).to.equal(20000)

//             const contributions = await contract.contributions.call(0);

//             let contributionDestructured = destructContribution(contributions);
//             expect(contributionDestructured.sender).to.equal(accounts[1]);
//             expect(contributionDestructured.value).to.equal(20000);
//             //     // let contributionID = await contract.contributionID.call();
//             //     // expect(contributionID).to.equal(1);

//             //     // let contributions = await contract.contributions.call(ContributionID);
//             //     // console.log(contributions)

//             //     // let contributor = sawait contract.contributionsByPeople.call();
//         })

//         it("should pass to minimumCollected and State = Succeded", async () => {

//             await contract.contribute({
//                 value: 20000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             let campaignStruct = await contract.newCampaign.call()

//             let campaignDestructured = destructCampaign(campaignStruct);

//             expect(campaignDestructured.amountRised).to.equal(2020000)
//             expect(campaignDestructured.minimumCollected).to.equal(true)
//             expect(campaignDestructured.state).to.equal(STATE.succed)
//         })

//         it("should not contribute during succes state", async ()=> {

//             await contract.contribute({
//                 value: 20000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });

//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });
//             let campaignStruct = await contract.newCampaign.call()

//             let campaignDestructured = destructCampaign(campaignStruct);
//             expect(campaignDestructured.state).to.equal(STATE.succed)

//             try{
//                 await contract.contribute({
//                     value: 500000,
//                     from: accounts[1]
//                 });
//             expect.fail()
//             } catch (err){

//             }


//         })

//         it("should not contribute after deadline", async () =>{
//             contract.setDate({from: userCampaignCreator});

//             try{
//             await contract.contribute({
//                 value: 500000,
//                 from: accounts[1]
//             });
//             expect.fail()
//             }
//             catch(error){
//             }
//         })

//         it("should withdraw the founds", async () =>{
//             await contract.contribute({
//                 value: 2000000,
//                 from: accounts[1]
//             });

//             let campaignStruct = await contract.newCampaign.call()

//             let campaignDestructured = destructCampaign(campaignStruct);

//             expect(campaignDestructured.amountRised).to.equal(2000000);

//            let beneficiaryInicialBalance = await web3.eth.getBalance(beneficiary)


//            await contract.withdraw({
//                from: userCampaignCreator
//            });

//            let beneficiaryFinalBalance = await web3.eth.getBalance(beneficiary)

//            expect(Number(beneficiaryFinalBalance)).to.equal( Number(beneficiaryInicialBalance) + 2000000)
//         })

//         // it("should have contributors", async () =>{

//         //     await contract.contribute({
//         //         value: 500000,
//         //         from: accounts[1]
//         //     });

//         //     await contract.contribute({
//         //         value: 500000,
//         //         from: accounts[6]
//         //     });

//         //     await contract.contribute({
//         //         value: 250000,
//         //         from: accounts[5]
//         //     });

            
//         //     await contract.contribute({
//         //         value: 250000,
//         //         from: accounts[5]
//         //     });

//         //     await contract.contribute({
//         //         value: 250000,
//         //         from: accounts[5]
//         //     });


//         // })

//         it("should refound the founds to the contribuitors", async () =>{

//             await contract.contribute({
//                 value: 3000,
//                 from: accounts[5]
//             });

            
//             await contract.contribute({
//                 value: 3000,
//                 from: accounts[5]
//             });

//             await contract.contribute({
//                 value: 200000,
//                 from: accounts[5]
//             });

//             await contract.contribute({
//                 value: 300000,
//                 from: accounts[4]
//             });

//             contract.setDate({from: userCampaignCreator});

//             let inicialBalance = await web3.eth.getBalance(accounts[5])
//             console.log(`this is the inicial balance ${inicialBalance}`)


//             await contract.claimFounds({from: accounts[5]});

//             let finalBalance = await web3.eth.getBalance(accounts[5])
//             console.log(`this is the final balance ${finalBalance}`)




//             // let contributionDestructured = destructContribution(contributions);


//         })
// })

// //  Contribution refundContribution = contributions[_contributionID];

// //     // send funds to the newly created balance claim contract
// //     balanceClaim = address(new BalanceClaim(refundContribution.sender));

// //     // set refunds claim address
// //     refundClaimAddress[_contributionID] = balanceClaim;

// //     // send funds to the newly created balance claim contract
// //     if (!balanceClaim.send(refundContribution.value)) {
// //       throw;
    })