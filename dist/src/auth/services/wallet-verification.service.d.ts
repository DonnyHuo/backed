export declare class WalletVerificationService {
    generateNonceMessage(nonce: string, appName?: string): string;
    verifySignature(address: string, signature: string, nonce: string): Promise<boolean>;
    isValidAddress(address: string): boolean;
}
