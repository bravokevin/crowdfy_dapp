const CrowdfyContract = artifacts.require('./Crowdfy');

contract('Crowdfy', (accounts) =>{
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
        2000000,
        2,
        beneficiary,
        {
            from: contractCreator,
            gas: 2000000
        }
        )
    })

    it("contract is initialized correctly", async () =>{
        let campaignName = await contract.campaignName.call()
        expect(campaignName).to.equal('My Campaign');

        let targetAmount = await contract.targetAmount.call()
        expect(Number(targetAmount)).to.equal(2000000);

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary);

        let actualOwner = await contract.owner.call()
        expect(actualOwner).to.equal(contractCreator);

        let fundingDeadLine = await contract.deadline.call()
        expect(Number(fundingDeadLine)).to.equal(2)

        let state = await contract.state.call()
        expect(Number(state.valueOf())).to.equal(STATE.ongoing);
    })
})