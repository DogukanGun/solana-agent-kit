import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { CancellationInput } from "../../types";

export class SolanaCancelVerificationTool extends Tool {
  name = "solana_cancel_program_verification";
  description = `Cancel verification of a program.
  Input is a JSON string with:
  - programId: string (required) - Solana program ID to verify
  - verifyProgramId: string (optional) - Custom verify program ID`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput: CancellationInput = JSON.parse(input);
      this.validateInput(parsedInput);

      if (!parsedInput.programId) {
        throw new Error("Program ID is required");
      }

      const programId = new PublicKey(parsedInput.programId);
      const verifyProgramId = parsedInput.verifyProgramId
        ? new PublicKey(parsedInput.verifyProgramId)
        : undefined;

      const signature = await this.solanaKit.cancelVerification(
        programId,
        verifyProgramId,
      );

      return JSON.stringify({
        status: "success",
        message: "Verification cancelled successfully",
        signature,
      });
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  private validateInput(input: CancellationInput): void {
    if (!input.programId) {
      throw new Error("Program ID is required");
    }
    if (!input.verifyProgramId) {
      throw new Error("Verified Program ID is required");
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
