import { Contract } from "ethers";
import { ensureEthereumAvailable, getSigner } from ".";
import { handleErrorMessage } from "@/lib/utils";
import { nftContract } from "./contract";

interface NFTMintError {
    code: string;
    message: string;
    details?: unknown;
}

interface TransactionError {
    code: string;
    message: string;
    details?: unknown;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const handleTransaction = async (txPromise: Promise<any>, retries = 0): Promise<any> => {
    try {
        return await txPromise;
    } catch (error: unknown) {
        if (retries < MAX_RETRIES &&
            error instanceof Error &&
            (error.message.includes('NETWORK_ERROR') || error.message.includes('TIMEOUT'))) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return handleTransaction(txPromise, retries + 1);
        }
        throw error;
    }
};

export const getNftContract = async (): Promise<Contract> => {
    const signer = await getSigner();
    return new Contract(
        nftContract.contractAddr,
        nftContract.contractABI,
        signer
    );
};

export const mintNFT = async (tokenURI: string) => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const tx = await handleTransaction(contract.mintNFT(tokenURI));
        const receipt = await tx.wait();

        // Get the NFTMinted event from the transaction receipt
        const event = receipt.logs
            .filter((log: any) => log.fragment?.name === 'NFTMinted')
            .map((log: any) => log.args)[0];

        return {
            tokenId: event.tokenId,
            creator: event.creator,
            tokenURI: event.tokenURI,
            transactionHash: receipt.hash
        };
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