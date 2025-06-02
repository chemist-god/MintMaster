import { Contract } from "ethers";
import { ensureEthereumAvailable, getSigner } from ".";
import { handleErrorMessage } from "@/lib/utils";
import { nftContract } from "./contract";

interface NFTMintError {
    code: string;
    message: string;
    details?: unknown;
}

export const getNftContract = async (): Promise<Contract> => {
    const signer = await getSigner();
    return new Contract(
        nftContract.contractAddr,
        nftContract.contractABI,
        signer
    );
};

export const mintNFT = async (to: string, tokenId: bigint, tokenURI: string) => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const tx = await handleTransaction(contract.mintNFT(tokenURI));
        const receipt = await tx.wait();
        return receipt;
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'MINT_ERROR',
            message: 'Failed to mint NFT',
            details: error
        } as TransactionError;
    }
};

export const getNFTDetails = async (tokenId: bigint) => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const [creator, tokenURI] = await Promise.all([
            contract.getCreator(tokenId),
            contract.tokenURI(tokenId)
        ]);

        return {
            tokenId,
            creator,
            tokenURI
        };
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'FETCH_ERROR',
            message: 'Failed to fetch NFT details',
            details: error
        } as NFTMintError;
    }
};