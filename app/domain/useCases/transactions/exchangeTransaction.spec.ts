import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, AggregateTransaction, Deadline, HashLockTransaction, Mosaic, MosaicId, PublicAccount, TransactionStatus, UInt64 } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { exchangeTransaction } from './exchangeTransaction';

describe('exchangeTransaction', () => {
  it('should return a new Transactions', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserPublicAccount = PublicAccount.createFromPublicKey("92170DAAEEA63B9FF90376E5511C65402C26E10877672DB0B7C0DE3B8F484A86", momijiBlockChain.networkType);
    const momijiSellerPublicAccount = PublicAccount.createFromPublicKey("9A1FE164BEFFB1C26526DAC582E1AB41C19695BF14902FDDD0478C47AAEED88E", momijiBlockChain.networkType);
    const momijiAggregateTxHash = "5AA3C9E0859E783A5AD9BC6F57BDB31868B93D84C14B23C9BD9138A688B08E1D";
    const result = await exchangeTransaction(momijiUserPublicAccount, momijiSellerPublicAccount, momijiAggregateTxHash);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  it('exchangeTransaction role play', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserPublicAccount = PublicAccount.createFromPublicKey("92170DAAEEA63B9FF90376E5511C65402C26E10877672DB0B7C0DE3B8F484A86", momijiBlockChain.networkType);
    const momijiSellerPublicAccount = PublicAccount.createFromPublicKey("9A1FE164BEFFB1C26526DAC582E1AB41C19695BF14902FDDD0478C47AAEED88E", momijiBlockChain.networkType);
    const momijiAggregateTxHash = "5AA3C9E0859E783A5AD9BC6F57BDB31868B93D84C14B23C9BD9138A688B08E1D";
    const momijiAggregateBondedTx = await exchangeTransaction(momijiUserPublicAccount, momijiSellerPublicAccount, momijiAggregateTxHash);

    const momijiAdminAccount = Account.createFromPrivateKey(process.env.PRIVATE_KEY, momijiBlockChain.networkType);

    //亜グリゲートボンデッドトランザクションの署名
    const momijiSignedAggregateBondedTx = momijiAdminAccount.sign(momijiAggregateBondedTx, momijiBlockChain.generationHash);
    const momijiSignedAggregateBondedTxHash = momijiSignedAggregateBondedTx.hash;

    //ハッシュロックトランザクションの作成
    const momijiHashLockTx = HashLockTransaction.create(
      Deadline.create(momijiBlockChain.epochAdjustment),
      new Mosaic(new MosaicId(momijiBlockChain.currencyMosaicId), UInt64.fromUint(10000000)),
      UInt64.fromUint(480),
      momijiSignedAggregateBondedTx,
      momijiBlockChain.networkType,
    ).setMaxFee(100);
  
    const momijiSignedHashLockTx = momijiAdminAccount.sign(momijiHashLockTx, momijiBlockChain.generationHash);
    const momijiSignedHashLockTxHash = momijiSignedHashLockTx.hash;
  
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedHashLockTx));

    await fetchTransactionStatus(
      momijiBlockChain,
      momijiSignedHashLockTxHash,
      momijiAdminAccount.address,
    );

    await new Promise(resolve => setTimeout(resolve, 5000)); // 全ノードに伝播するまで5秒待機

    await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBonded(momijiSignedAggregateBondedTx));

    const res2 = await fetchTransactionStatus(
      momijiBlockChain,
      momijiSignedAggregateBondedTxHash,
      momijiAdminAccount.address,
    );

    expect(res2).toBeInstanceOf(TransactionStatus);
    expect(res2.code).toEqual('Success');
    expect(res2.group).toEqual('partial');  
  
  }, 120000); // 120 seconds
});
