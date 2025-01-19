import {
  PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../../agent";

/**
 * Cancel an existing program verification
 * @param agent SolanaAgentKit instance
 * @param programId Program ID to cancel verification
 * @param verifyProgramId Optional custom verify program ID
 * @returns Transaction signature
 */
export async function cancelVerification(
  agent: SolanaAgentKit,
  programId: PublicKey,
  verifyProgramId?: PublicKey,
): Promise<string> {
  // Use provided verify program ID or default
  const verificationProgramId =
    verifyProgramId ||
    new PublicKey("vfPD3zB5TipA61PJq5qWQwJqg4mZpkZwA4Z1YFRHy6m");

  // Find the verification PDA
  const [verificationPda] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("verification"),
      programId.toBuffer(),
      agent.wallet_address.toBuffer(),
    ],
    verificationProgramId,
  );

  // Create cancel instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: agent.wallet_address, isSigner: true, isWritable: true },
      { pubkey: verificationPda, isSigner: false, isWritable: true },
      { pubkey: programId, isSigner: false, isWritable: false },
    ],
    programId: verificationProgramId,
    data: Buffer.from([1]),
  });

  // Send transaction
  const transaction = new Transaction().add(instruction);
  return await agent.connection.sendTransaction(transaction, [agent.wallet]);
}
