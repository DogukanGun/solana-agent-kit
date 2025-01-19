import axios from "axios";
/**
 * Check verification status for a program
 * @param programId Program ID to check
 * @returns Verification status from API
 */
export async function checkVerificationStatus(programId: string): Promise<{
  is_verified: boolean;
  message: string;
  on_chain_hash: string;
  executable_hash: string;
  repo_url: string;
  commit: string;
  last_verified_at: string | null;
}> {
  const response = await axios.get(
    `https://verify.osec.io/status/${programId}`,
  );
  return response.data;
}
