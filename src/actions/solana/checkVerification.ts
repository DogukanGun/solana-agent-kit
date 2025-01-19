import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";

const checkVerificationAction: Action = {
  name: "CHECK_VERIFICATION_ACTION",
  similes: [
    "check program verification",
    "verify program status",
    "program status check",
    "check verification status",
  ],
  description: `Check the status of a Solana program verification.
  Input should include:
  - programId: string (required) - Solana program ID to verify.`,
  examples: [
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
        },
        output: {
          status: "success",
          verificationStatus: "verified",
        },
        explanation:
          "Check if the program has been verified based on the given programID 9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
      },
    ],
    [
      {
        input: {
          programId: "9xQeWvG816bUx9EPg8d7kz9hyo3e7ho6uoDwVtG23Ywd",
        },
        output: {
          status: "success",
          verificationStatus: "verified",
        },
        explanation:
          "Check if the program has been verified based on the given programID",
      },
    ],
  ],
  schema: z.object({
    programId: z.string().nonempty("Program ID is required"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const status = await agent.checkVerificationStatus(input.programId);

      return {
        status: "success",
        ...status,
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

export default checkVerificationAction;
