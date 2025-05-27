// 1. Remove unused NFTMetadata import since it's used in createAndUploadMetadata
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { getContractOwner, mintNFT } from "@/services/serviceFn";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createAndUploadMetadata, uploadToIPFS } from "@/services/pinata";

type uploadStatus = "idle" | "uploading" | "minting" | "success" | "error";

export default function MintForm() {
  const { address } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [status, setStatus] = useState<uploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState("");

  const checkOwnership = useCallback(async () => {
    if (!address) return;
    try {
      const owner = await getContractOwner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking contract owner", error);
      setIsOwner(false);
    }
  }, [address]);

  useEffect(() => {
    checkOwnership();
  }, [checkOwnership]); // Now checkOwnership is properly memoized

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      // Check if the file is max 10 mb
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      // Check if the file is an image
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file || !name || !description || !recipientAddress || !tokenId) return;

    if (!isOwner) {
      toast.error("You are not the contract owner");
      return;
    }

    // validate token id
    const tokenIdNum = parseInt(tokenId);
    if (isNaN(tokenIdNum) || tokenIdNum <= 0) {
      toast.error("Invalid token ID");
      return;
    }

    // Validate recipient address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast.error("Invalid recipient address");
      return;
    }

    setStatus("uploading");
    setUploadProgress("Uploading image to IPFS...");

    try {
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(file);
      setUploadProgress("Uploading metadata to IPFS...");

      await createAndUploadMetadata(imageUrl, { // Remove metadataUrl assignment since it's not used
        name,
        description
      });

      setUploadProgress("Minting NFT...");
      setStatus("minting");

      await mintNFT(recipientAddress, BigInt(tokenIdNum));

      setStatus("success");
      toast.success("NFT minted successfully!");

      // Reset form
      setFile(null);
      setName("");
      setDescription("");
      setRecipientAddress("");
      setTokenId("");
      setPreviewUrl("");
      setUploadProgress("");
    } catch (error) {
      console.error("Error minting NFT:", error);
      setStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Failed to mint NFT"
      );
    }
  };

  const isDisabled =
    status === "uploading" ||
    status === "minting" ||
    !file ||
    !name ||
    !description ||
    !isOwner ||
    !recipientAddress ||
    !tokenId;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {!isOwner && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
          Only the contract owner can mint NFTs
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Image</label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={status === "uploading" || status === "minting" || !isOwner}
        />
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NFT Name"
          required
          disabled={status === "uploading" || status === "minting" || !isOwner}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="NFT Description"
          required
          disabled={status === "uploading" || status === "minting" || !isOwner}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipient Address</label>
        <Input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
          required
          disabled={status === "uploading" || status === "minting" || !isOwner}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Token ID</label>
        <Input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Enter token ID"
          required
          min="1"
          disabled={status === "uploading" || status === "minting" || !isOwner}
        />
      </div>
      {uploadProgress && (
        <div className="text-sm text-muted-foreground">{uploadProgress}</div>
      )}

      <Button type="submit" disabled={isDisabled} className="w-full">
        {status === "uploading" || status === "minting" ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {status === "uploading" ? "Uploading..." : "Minting..."}
          </>
        ) : (
          "Mint NFT"
        )}
      </Button>
    </form>
  );
}