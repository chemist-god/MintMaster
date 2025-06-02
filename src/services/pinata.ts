import { PinataSDK } from 'pinata'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_GATEWAY_URL
});

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export interface UploadProgress {
    stage: 'preparing' | 'uploading' | 'processing' | 'complete';
    progress: number;
    message: string;
}

export const validateFile = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
}

export const uploadToIPFS = async (
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        validateFile(file);

        onProgress?.({ stage: 'preparing', progress: 0, message: 'Preparing upload...' });

        const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!urlResponse.ok) {
            throw new Error('Failed to get upload URL');
        }

        const data = await urlResponse.json();
        onProgress?.({ stage: 'uploading', progress: 30, message: 'Uploading to IPFS...' });

        const upload = await pinata.upload.public
            .file(file)
            .url(data.url);

        if (!upload.cid) {
            throw new Error('Upload failed - no CID returned');
        }

        onProgress?.({ stage: 'processing', progress: 70, message: 'Processing upload...' });
        const ipfsUrl = await pinata.gateways.public.convert(upload.cid);

        onProgress?.({ stage: 'complete', progress: 100, message: 'Upload complete' });
        return ipfsUrl;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload to IPFS');
    }
};

export const createAndUploadMetadata = async (
    imageUrl: string,
    metadata: Omit<NFTMetadata, 'image'>,
    onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
    try {
        onProgress?.({ stage: 'preparing', progress: 0, message: 'Preparing metadata...' });

        const nftMetadata: NFTMetadata = {
            ...metadata,
            image: imageUrl
        };

        onProgress?.({ stage: 'uploading', progress: 30, message: 'Uploading metadata to IPFS...' });

        const metadataBlob = new Blob([JSON.stringify(nftMetadata, null, 2)], {
            type: 'application/json'
        });

        const metadataFile = new File([metadataBlob], 'metadata.json', {
            type: 'application/json'
        });

        // Get presigned URL first
        const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!urlResponse.ok) {
            throw new Error(`Failed to get upload URL: ${urlResponse.status}`);
        }

        const data = await urlResponse.json();
        if (!data.url) {
            throw new Error('Invalid response from server - no URL received');
        }

        // Use the presigned URL for upload
        const upload = await pinata.upload.public
            .file(metadataFile)
            .url(data.url);

        if (!upload.cid) {
            throw new Error('Metadata upload failed - no CID returned');
        }

        onProgress?.({ stage: 'processing', progress: 70, message: 'Processing metadata...' });
        const metadataUrl = await pinata.gateways.public.convert(upload.cid);

        onProgress?.({ stage: 'complete', progress: 100, message: 'Metadata upload complete' });
        return metadataUrl;
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to IPFS');
    }
};
export const uploadNFT = async (
    imageFile: File,
    metadata: Omit<NFTMetadata, 'image'>,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ imageUrl: string; metadataUrl: string }> => {
    try {
        // First upload the image
        const imageUrl = await uploadToIPFS(imageFile, (progress) => {
            onProgress?.({
                ...progress,
                progress: progress.progress * 0.5 // First half of the total progress
            });
        });

        // Then create and upload the metadata
        const metadataUrl = await createAndUploadMetadata(imageUrl, metadata, (progress) => {
            onProgress?.({
                ...progress,
                progress: 50 + (progress.progress * 0.5) // Second half of the total progress
            });
        });

        return { imageUrl, metadataUrl };
    } catch (error) {
        console.error('Error in NFT upload process:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload NFT');
    }
};