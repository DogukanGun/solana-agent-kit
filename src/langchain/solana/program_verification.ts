import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import {
  VerificationInput,
  VerificationOptions,
  VerificationResponse,
} from "../../types";

export class SolanaVerifyTool extends Tool {
  name = "solana_program_verification";
  description = `Verify a Solana program using its source code repository.
  Input is a JSON string with:
  - programId: string (required) - Solana program ID to verify
  - repository: string (required) - GitHub repository URL
  - commitHash: string (required) - Git commit hash or branch name
  - verifyProgramId: string (optional) - Custom verify program ID
  - libName: string (optional) - Library name for multi-program repos
  - bpfFlag: boolean (optional) - Use cargo build-bpf instead of build-sbf
  - cargoArgs: string[] (optional) - Additional cargo build arguments`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput: VerificationInput = JSON.parse(input);

      this.validateInput(parsedInput);

      const options: VerificationOptions = {
        verifyProgramId: parsedInput.verifyProgramId
          ? new PublicKey(parsedInput.verifyProgramId)
          : null,
        libName: parsedInput.libName ?? null,
        bpfFlag: parsedInput.bpfFlag ?? null,
        cargoArgs: parsedInput.cargoArgs ?? null,
      };

      const result = await this.solanaKit.verifyProgram(
        parsedInput.programId,
        parsedInput.repository,
        parsedInput.commitHash,
        options,
      );

      return this.formatSuccessResponse(result);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

  private validateInput(input: VerificationInput): void {
    if (!input.programId) {
      throw new Error("Program ID is required");
    }
    if (!input.repository) {
      throw new Error("Repository URL is required");
    }
    if (!input.commitHash) {
      throw new Error("Commit hash is required");
    }
  }

  private formatSuccessResponse(result: VerificationResponse): string {
    return JSON.stringify({
      status: "success",
      verificationPda: result.verificationPda,
      message: result.message,
      jobId: result.jobId,
    });
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
