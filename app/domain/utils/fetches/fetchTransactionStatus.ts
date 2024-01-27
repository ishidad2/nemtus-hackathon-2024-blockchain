import { TransactionStatus, Address } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';

export const fetchTransactionStatus = async (
  blockChain: any,
  hash: string,
  targetAddress: Address,
): Promise<TransactionStatus> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async function () {
      const transactionStatus: TransactionStatus = await firstValueFrom(
        blockChain.tsRepo.getTransactionStatus(hash),
      );
      console.log(transactionStatus);
      console.log(`${blockChain.explorerUrl}/transactions/${hash}`);
      if (transactionStatus.code === 'Success') {
        if (transactionStatus.group === 'confirmed' || transactionStatus.group === 'partial') {
          resolve(transactionStatus);
        } else {
          await blockChain.listener.open();
          blockChain.listener.confirmed(targetAddress, hash).subscribe(async () => {
            const transactionStatus: TransactionStatus = await firstValueFrom(
              blockChain.tsRepo.getTransactionStatus(hash),
            );
            blockChain.listener.close();
            resolve(transactionStatus);
          });
          blockChain.listener.aggregateBondedAdded(targetAddress, hash).subscribe(async () => {
            const transactionStatus: TransactionStatus = await firstValueFrom(
              blockChain.tsRepo.getTransactionStatus(hash),
            );
            blockChain.listener.close();
            resolve(transactionStatus);
          });
        }
      } else {
        reject(transactionStatus);
      }
    }, 1000); //タイマーを1秒に設定
  });
};
