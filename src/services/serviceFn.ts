import { Contract } from "ethers";
import { ensureEthereumAvailable, getNftContract } from ".";
import { handleErrorMessage } from "@/lib/utils";

export const getName = async () => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const name = await contract.name();
        return name;
    } catch (error) {
        handleErrorMessage(error);
        throw error;
    }
}

export const mintNFT = async (to: string, tokenId: bigint) =>{
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const tx = await contract.safeMint(to, tokenId);
        const receipt = await tx.wait();

        return receipt;
    } catch (error) {
        handleErrorMessage(error);
        throw error;
    }
}

export const getContractOwner = async () => {
    await ensureEthereumAvailable();

    try {
        const contract: Contract = await getNftContract();
        const owner = await contract.owner();
        return owner;
    } catch (error) {
        handleErrorMessage(error);
        throw error;
    }
}