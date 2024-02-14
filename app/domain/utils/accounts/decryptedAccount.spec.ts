import fetch from 'node-fetch';
global.fetch = fetch;

import { decryptedAccount } from './decryptedAccount';
import { Account, PublicAccount } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { encryptedAccount } from './encryptedAccount';
import { fetchAccountMetaData } from '../fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey } from '../../../consts/consts';
import { decryptedAccountForNode } from './decryptedAccountForNode';

describe('decryptedAccount', () => {
  test.skip('should return an Account object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiNewAccount = Account.generateNewAccount(momijiBlockChain.networkType);
    const password = 'pass';
    const strSignerQR = encryptedAccount(momijiBlockChain, momijiNewAccount, password);
    console.log(strSignerQR);
    const result = decryptedAccount(momijiBlockChain, strSignerQR, password);
    expect(result).toBeInstanceOf(Account);
  }, 10000); // 10 seconds

  test.only('should return an specific account object', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolTargetPublicAccount = PublicAccount.createFromPublicKey(
      '7B4588AEF0D8AD9DF3AADD7F1B587E32DB03EF3D98F2C9C58A98018C40E512CC',
      symbolBlockChain.networkType,
    );
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolTargetPublicAccount.address,
    );
    console.log(strSignerQR);
    const momijiBlockChain = await setupBlockChain('momiji');
    const password = 'pass';
    const result = decryptedAccountForNode(momijiBlockChain, strSignerQR, password);
    console.log(result.address.plain());
    console.log(result.privateKey)
    expect(result).toBeInstanceOf(Account);
  }, 10000); // 10 seconds
});
