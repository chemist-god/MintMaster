import { Contract } from "ethers";
import { ensureEthereumAvailable, getSigner } from ".";
import { handleErrorMessage } from "@/lib/utils";
import { nftContract } from "./contract";

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

const getNftContract = async (): Promise<Contract> => {
    const signer = await getSigner();
    return new Contract(
        nftContract.contractAddr,
        nftContract.contractABI,
        signer
    );
};

export const getName = async () => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const name = await handleTransaction(contract.name());
        return name;
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'CONTRACT_ERROR',
            message: 'Failed to get contract name',
            details: error
        } as TransactionError;
    }
}

export const mintNFT = async (to: string, tokenId: bigint) => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const tx = await handleTransaction(contract.safeMint(to, tokenId));
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
}

export const getContractOwner = async () => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const owner = await handleTransaction(contract.owner());
        return owner;
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'OWNER_ERROR',
            message: 'Failed to get contract owner',
            details: error
        } as TransactionError;
    } 
    
}
