import { PublicKey } from "@solana/web3.js";
import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";

const cancelVerificationAction: Action = {
  name: "CANCEL_VERIFICATION_ACTION",
  similes: [
    "cancel program verification",
    "revoke program verification",
    "stop verification",
    "disable verification",
  ],
  description: `Cancel verification of a Solana program.
  Input should include:
  - programId: string (required) - Solana program ID to cancel verification for.
  - verifyProgramId: string (optional) - Custom verify program ID.`,
  examples: [
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
        },
        output: {
          status: "success",
          message: "Verification cancelled successfully",
          signature: "5k2qZwyEr9F...",
        },
        explanation: "Cancel the default verification for the program.",
      },
    ],
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
          verifyProgramId: "Verify111111111111111111111111111111111111111",
        },
        output: {
          status: "success",
          message: "Verification cancelled successfully",
          signature: "3Pqw8Er4tDy...",
        },
        explanation: "Cancel a custom verification for the program.",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().nonempty("Program ID is required"),
    verifyProgramId: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const programId = new PublicKey(input.programId);
      const verifyProgramId = input.verifyProgramId
        ? new PublicKey(input.verifyProgramId)
        : undefined;

      const signature = await agent.cancelVerification(
        programId,
        verifyProgramId,
      );

      return {
        status: "success",
        message: "Verification cancelled successfully",
        signature,
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

export default cancelVerificationAction;
