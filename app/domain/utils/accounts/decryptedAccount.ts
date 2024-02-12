import { Account } from 'symbol-sdk';
import { AccountQR } from '../../entities/accountQR/accountQR';

export const decryptedAccount = (
  blockChain: any,
  strSignerQR: string,
  password: string,
): Account => {
  let arrQr;
  if (typeof window !== 'undefined') {
    // ブラウザ環境でのみインポート
    arrQr = require('symbol-qr-library').AccountQR;
  }
  //JSONデータをQRコードに変換
  const jsonStrSignerQR = JSON.parse(strSignerQR);
  const signerQR = arrQr.fromJSON(jsonStrSignerQR, password);
  const targetAccount = Account.createFromPrivateKey(
    signerQR.accountPrivateKey,
    blockChain.networkType,
  );
  return targetAccount;
};
