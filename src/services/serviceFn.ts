import { Contract, LogDescription } from "ethers";
import { ensureEthereumAvailable, getSigner } from ".";
import { handleErrorMessage } from "@/lib/utils";
import { nftContract } from "./contract";

interface TransactionError {
    code: string;
    message: string;
    details?: unknown;
}

interface NFTDetails {
    tokenId: bigint;
    creator: string;
    tokenURI: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const handleTransaction = async <T>(txPromise: Promise<T>, retries = 0): Promise<T> => {
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

export const getName = async (): Promise<string> => {
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

export const mintNFT = async (tokenURI: string): Promise<NFTDetails> => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const tx = await handleTransaction(contract.mintNFT(tokenURI));
        const receipt = await tx.wait();

        // Get the NFTMinted event from the transaction receipt
        const event = (receipt.logs as LogDescription[])
            .filter((log) => log.fragment?.name === 'NFTMinted')
            .map((log) => log.args)[0];

        return {
            tokenId: event.tokenId,
            creator: event.creator,
            tokenURI: event.tokenURI
        };
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'MINT_ERROR',
            message: 'Failed to mint NFT',
            details: error
        } as TransactionError;
    }
}

export const getContractOwner = async (): Promise<string> => {
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

export const transfer = async (to: string, tokenId: bigint): Promise<{ transactionHash: string }> => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const signer = await getSigner();
        const from = await signer.getAddress();

        const tx = await handleTransaction(contract.transferFrom(from, to, tokenId));
        const receipt = await tx.wait();

        return {
            transactionHash: receipt.hash
        };
    } catch (error: unknown) {
        handleErrorMessage(error);
        throw {
            code: error instanceof Error ? error.message : 'TRANSFER_ERROR',
            message: 'Failed to transfer NFT',
            details: error
        } as TransactionError;
    }
}

export const getNFTDetails = async (tokenId: bigint): Promise<NFTDetails> => {
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
        } as TransactionError;
    }
}