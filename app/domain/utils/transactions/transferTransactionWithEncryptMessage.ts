import {
  Account,
  PublicAccount,
  TransferTransaction,
  Deadline,
  EncryptedMessage,
} from 'symbol-sdk';

export const transferTransactionWithEncryptMessage = (
  blockChain: any,
  message: string,
  srcAccount: Account,
  targetPublicAccount: PublicAccount,
): TransferTransaction => {
  const transferTx = TransferTransaction.create(
    Deadline.create(blockChain.epochAdjustment),
    targetPublicAccount.address,
    [],
    EncryptedMessage.create(message, targetPublicAccount, srcAccount.privateKey),
    blockChain.networkType,
  ).setMaxFee(100) as TransferTransaction;
  return transferTx;
};
