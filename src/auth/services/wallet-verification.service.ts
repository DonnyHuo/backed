import { Injectable } from '@nestjs/common';
import { verifyMessage } from 'ethers';

/**
 * Service for verifying Ethereum wallet signatures
 */
@Injectable()
export class WalletVerificationService {
  /**
   * Generate a nonce message for the user to sign
   */
  generateNonceMessage(nonce: string, appName = 'Posts App'): string {
    return `Sign this message to login to ${appName}\n\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any fees.`;
  }

  /**
   * Verify that a signature was created by the wallet address owner
   * @param address - The wallet address
   * @param signature - The signature of the message
   * @param nonce - The nonce that was signed
   * @returns true if signature is valid, false otherwise
   */
  async verifySignature(
    address: string,
    signature: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      // Generate the message that should have been signed
      const message = this.generateNonceMessage(nonce);

      // Recover the address from the signature
      const recoveredAddress = verifyMessage(message, signature);

      // Compare addresses (case-insensitive)
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      // If signature verification fails, return false
      return false;
    }
  }

  /**
   * Validate Ethereum address format
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

