const CrowdfyFabricContract = artifacts.require('./CrowdfyFabric');

contract('CrowdfyFabric', accounts => {
    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[2];
    

    before(async () => {
        contract = await CrowdfyFabricContract.new(
            {
                from: contractCreator,
                gas: 2000000
            }
        )
    })

    it("should create a campaign instance", async () =>{
        const campaignContract = await contract.createCampaign("My Campaign",
        2000000,
        1623046581,
        1000000,
        beneficiary,);

        // const theCampaignAddress = await contract.campaigns.call(0)

        // console.log(theCampaignAddress)

        // const campaignContract1 = await contract.createCampaign("afadfan",
        // 2000000,
        // 2,
        // 1000000,
        // beneficiary,);

        // const theCampaignAddress1 = await contract.campaigns.call(1)

        // console.log(theCampaignAddress1)

    })
})