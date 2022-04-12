import { MockProvider } from '@ethereum-waffle/provider'
import { expect } from 'earljs'
import { BigNumber, Contract, ContractFactory, Wallet } from 'ethers'

describe('toEmit', function () {
  this.timeout(10000)

  let events: Contract

  before(async function () {
    this.timeout(10000)
    const [wallet] = new MockProvider().getWallets()
    events = await deployFactory(wallet)
  })

  it('checks that event was emitted', async () => {
    await expect(events.emitOne()).toEmit(events, 'One')
  })

  it('checks that event was not emitted', async () => {
    await expect(events.emitOne()).not.toEmit(events, 'Two')
  })

  it('checks args', async () => {
    await expect(events.emitOne()).toEmit(events, 'One', [BigNumber.from(1), 'One', expect.aHexString(64)])
    await expect(events.emitOne()).not.toEmit(events, 'One', [BigNumber.from(2), 'Two'])
  })
})

// We're setting `process.env.NODE_OPTIONS` to `--openssl-legacy-provider`
// just for this test.
async function deployFactory(wallet: Wallet) {
  const EVENTS_ABI = [
    'event One(uint value, string msg, bytes32 encoded)',
    'event Two(uint indexed value, string msg)',
    'event Arrays(uint256[3] value, bytes32[2] encoded)',
    'function emitOne() public',
    'function emitOneMultipleTimes() public',
    'function emitTwo() public',
    'function emitBoth() public',
    'function emitArrays() public',
    'function doNotEmit() pure public',
  ]

  // eslint-disable-next-line max-len
  const EVENTS_BYTECODE =
    '608060405234801561001057600080fd5b50610586806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806334c10115146100675780633f0e64ba14610071578063a35a3a0d1461007b578063b2f9983814610085578063d5eacee01461008f578063db6cdf6814610099575b600080fd5b61006f6100a3565b005b61007961010f565b005b6100836101ac565b005b61008d6102b2565b005b610097610466565b005b6100a161054e565b005b60027f726d8d77432fef0b8999b8e1f5ed6d11c42c0a861c61228b03e767ad3c43d0df6040518080602001828103825260038152602001807f54776f000000000000000000000000000000000000000000000000000000000081525060200191505060405180910390a2565b7f824e7918d5bcff68837d677d05258e17ec7b1bd7b488aa5e3bd2d5cbefa9e04c60017ecfbbaf7ddb3a1476767101c12a0162e241fbad2a0162e2410cfbbaf716212360405180838152602001806020018360001b8152602001828103825260038152602001807f4f6e650000000000000000000000000000000000000000000000000000000000815250602001935050505060405180910390a1565b7f35cf379c46b4950eedc35bc96d30e9fe7480e2422431c50ea5c4b211ee6b1b8d60405180606001604052806001815260200160028152602001600381525060405180604001604052807ecfbbaf7ddb3a1476767101c12a0162e241fbad2a0162e2410cfbbaf716212360001b81526020017ecfbbaf7ddb3a1476767101c12a0162e241fbad2a0162e2410cfbbaf716212460001b8152506040518083600360200280838360005b8381101561026f578082015181840152602081019050610254565b5050505090500182600260200280838360005b8381101561029d578082015181840152602081019050610282565b505050509050019250505060405180910390a1565b7f824e7918d5bcff68837d677d05258e17ec7b1bd7b488aa5e3bd2d5cbefa9e04c60017ecfbbaf7ddb3a1476767101c12a0162e241fbad2a0162e2410cfbbaf716212360405180838152602001806020018360001b8152602001828103825260038152602001807f4f6e650000000000000000000000000000000000000000000000000000000000815250602001935050505060405180910390a17f824e7918d5bcff68837d677d05258e17ec7b1bd7b488aa5e3bd2d5cbefa9e04c60017ecfbbaf7ddb3a1476767101c12a0162e241fbad2a0162e2410cfbbaf716212360405180838152602001806020018360001b8152602001828103825260038152602001807f4f6e650000000000000000000000000000000000000000000000000000000000815250602001935050505060405180910390a17f824e7918d5bcff68837d677d05258e17ec7b1bd7b488aa5e3bd2d5cbefa9e04c60018060405180838152602001806020018360001b8152602001828103825260128152602001807f446966666572656e744b696e644f664f6e650000000000000000000000000000815250602001935050505060405180910390a1565b7f824e7918d5bcff68837d677d05258e17ec7b1bd7b488aa5e3bd2d5cbefa9e04c60018060405180838152602001806020018360001b8152602001828103825260038152602001807f4f6e650000000000000000000000000000000000000000000000000000000000815250602001935050505060405180910390a160027f726d8d77432fef0b8999b8e1f5ed6d11c42c0a861c61228b03e767ad3c43d0df6040518080602001828103825260038152602001807f54776f000000000000000000000000000000000000000000000000000000000081525060200191505060405180910390a2565b56fea2646970667358221220e505630e9a894ec6127d6e69224f74fa696a208c9a5fa71ef29f18bd2303fb9e64736f6c63430006000033'

  const factory = new ContractFactory(EVENTS_ABI, EVENTS_BYTECODE, wallet)

  return await factory.deploy()
}