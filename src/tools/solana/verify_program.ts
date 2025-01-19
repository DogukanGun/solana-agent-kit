import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  SolanaAgentKit,
  VerificationOptions,
  VerificationResponse,
} from "../../index";
import { BN } from "@coral-xyz/anchor";
import axios from "axios";

/**
 * Verifies a Solana program by signing a PDA and submitting to verification
 * @param agent SolanaAgentKit instance
 * @param programId Program ID to verify
 * @param repository GitHub repository URL
 * @param commitHash Git commit hash or branch
 * @param options Additional verification options including custom verify program ID
 * @returns Object containing verification PDA address and status
 */
export async function verifyProgram(
  agent: SolanaAgentKit,
  programId: string,
  repository: string,
  commitHash: string,
  options?: VerificationOptions,
): Promise<VerificationResponse> {
  try {
    // Validate program ID
    const programPubkey = new PublicKey(programId);
    if (!PublicKey.isOnCurve(programPubkey)) {
      throw new Error("Invalid program ID");
    }

    // Check if program exists
    const programInfo = await agent.connection.getAccountInfo(programPubkey);
    if (!programInfo) {
      throw new Error(`Program ${programId} does not exist`);
    }

    // Use provided verify program ID or default to OtterSec
    const verifyProgramId =
      options?.verifyProgramId ||
      new PublicKey("verifycLy8mB96wd9wqq3WDXQwM4oU6r42Th37Db9fC");

    // Find PDA for verification
    const [verificationPda, bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("otter_verify"),
        agent.wallet_address.toBuffer(),
        verifyProgramId.toBuffer(),
      ],
      verifyProgramId,
    );

    // Create verification data
    const verificationData = {
      params: {
        repository,
        commitHash,
        buildArgs: options?.cargoArgs || [],
        buildEnv: options?.bpfFlag ? "bpf" : "sbf",
        verifier: agent.wallet_address.toString(),
      },
    };

    // Create verification instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: verificationPda, isSigner: false, isWritable: true },
        { pubkey: agent.wallet_address, isSigner: true, isWritable: true },
        { pubkey: programPubkey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: verifyProgramId,
      data: Buffer.concat([
        Buffer.from([3]), // Instruction discriminator for verify
        Buffer.from(JSON.stringify(verificationData)),
      ]),
    });

    // Sign and send verification transaction
    const transaction = new Transaction().add(instruction);
    const signature = await agent.connection.sendTransaction(
      transaction,
      [agent.wallet],
      { preflightCommitment: "confirmed" },
    );
    await agent.connection.confirmTransaction(signature);

    // Submit verification job
    const verifyResponse = await axios.post("https://verify.osec.io/verify", {
      program_id: programId,
      repository,
      commit_hash: commitHash,
      lib_name: options?.libName,
      bpf_flag: options?.bpfFlag,
      cargo_args: options?.cargoArgs,
    });

    const jobId = verifyResponse.data.job_id;

    // Monitor verification status
    let attempts = 0;
    while (attempts < 30) {
      // 5 min timeout (10s intervals)
      const status = await axios.get(`https://verify.osec.io/jobs/${jobId}`);

      if (status.data.status === "completed") {
        return {
          status: "success",
          message: "Program verification successful",
          verificationPda: verificationPda.toString(),
          jobId,
        };
      } else if (status.data.status === "failed") {
        throw new Error(
          `Verification failed: ${status.data.error || "Unknown error"}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error("Verification timed out");
  } catch (error: any) {
    console.error("Full error details:", error);
    throw error;
  }
}
