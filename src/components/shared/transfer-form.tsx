import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { transfer } from "@/services/serviceFn";

export default function TransferForm() {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsLoading(true);
    toast.loading("Transferring...");

    try {
      const { transactionHash } = await transfer(recipient, BigInt(tokenId));
      toast.success("Transfer successful");
      console.log("Transaction hash:", transactionHash);

      setRecipient("");
      setTokenId("");
    } catch (error) {
      toast.error("Transfer failed");
      console.error("Transfer error:", error);
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Transfer NFT</h3>
        <p className="text-sm text-muted-foreground">
          Transfer your NFT to another address
        </p>
      </div>

      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />

        <Input
          type="number"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          min="0"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Transferring..." : "Transfer"}
      </Button>
    </form>
  );
}
