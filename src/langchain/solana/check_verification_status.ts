import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";

interface StatusCheckInput {
  programId: string;
}

export class SolanaCheckVerificationTool extends Tool {
  name = "solana_check_program_verification";
  description = `Check the status of a Solana program verification.
  Input is a JSON string with:
  - programId: string (required) - Solana program ID to verify`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput: StatusCheckInput = JSON.parse(input);

      if (!parsedInput.programId) {
        throw new Error("Program ID is required");
      }

      const status = await this.solanaKit.checkVerificationStatus(
        parsedInput.programId,
      );

      return JSON.stringify({
        status: "success",
        ...status,
      });
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  private formatErrorResponse(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return JSON.stringify({
      status: "error",
      message: errorMessage,
      code:
        error instanceof Error && "code" in error
          ? (error as any).code
          : "UNKNOWN_ERROR",
    });
  }
}
