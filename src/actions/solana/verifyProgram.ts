import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";

const solanaVerifyAction: Action = {
  name: "SOLANA_PROGRAM_VERIFY_ACTION",
  similes: [
    "verify program on Solana",
    "verify a Solana program",
    "validate program source code",
  ],
  description: `Verify a Solana program using its source code repository.
  Input should include:
  - programId: string (required) - Solana program ID to verify.
  - repository: string (required) - GitHub repository URL.
  - commitHash: string (required) - Git commit hash or branch name.
  - verifyProgramId: string (optional) - Custom verify program ID.
  - libName: string (optional) - Library name for multi-program repos.
  - bpfFlag: boolean (optional) - Use cargo build-bpf instead of build-sbf.
  - cargoArgs: string[] (optional) - Additional cargo build arguments.`,
  examples: [
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
          repository: "https://github.com/your/repo",
          commitHash: "abc123",
        },
        output: {
          status: "success",
          verificationPda: "PdaAddress123",
          message: "Verification job started successfully",
          jobId: "job123",
        },
        explanation:
          "Verify the program using the specified repository and commit hash.",
      },
    ],
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
          repository: "https://github.com/your/repo",
          commitHash: "abc123",
          verifyProgramId: "Verify111111111111111111111111111111111111111",
        },
        output: {
          status: "success",
          verificationPda: "PdaAddress456",
          message:
            "Verification job started successfully with custom verify program ID",
          jobId: "job456",
        },
        explanation: "Verify the program with a custom verification program.",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().nonempty("Program ID is required"),
    repository: z.string().nonempty("Repository URL is required"),
    commitHash: z.string().nonempty("Commit hash is required"),
    verifyProgramId: z.string().optional(),
    libName: z.string().optional(),
    bpfFlag: z.boolean().optional(),
    cargoArgs: z.array(z.string()).optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const programId = new PublicKey(input.programId);
      const repository = input.repository;
      const commitHash = input.commitHash;
      const verifyProgramId = new PublicKey(input.verifyProgramId);

      const options = {
        verifyProgramId,
        libName: input.libName ?? null,
        bpfFlag: input.bpfFlag ?? null,
        cargoArgs: input.cargoArgs ?? null,
      };

      const result = await agent.verifyProgram(
        programId.toBase58(),
        repository,
        commitHash,
        options,
      );

      return {
        status: "success",
        verificationPda: result.verificationPda,
        message: result.message,
        jobId: result.jobId,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  },
};

export default solanaVerifyAction;
