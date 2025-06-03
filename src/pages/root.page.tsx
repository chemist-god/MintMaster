import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import Wrapper from "@/components/shared/wrapper";
import { getName } from "@/services/serviceFn";
import { truncateAddr } from "@/lib/utils";
import { MdSignalWifiStatusbarConnectedNoInternet } from "react-icons/md";
import MintForm from "@/components/nft/mint-form";

export default function RootPage() {
  const { isConnected, address } = useAccount();
  const [tokenName, setTokenName] = useState<string>("");

  const {
    fn: getNameFn,
    data: name,
    isLoading: isFetchingName,
  } = useFetch(getName);

  useEffect(() => {
    getNameFn();
  }, [getNameFn, address]);

  useEffect(() => {
    if (name) {
      setTokenName(name);
    }
  }, [name]);

  return (
    <Wrapper className="flex flex-col w-full h-[calc(100%-80px)] py-10 relative">
      {isConnected ? (
        <div className="mx-auto max-w-3xl size-full flex flex-col gap-8 flex-1">
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-normal text-white">
                👋 Welcome, {truncateAddr(address)}
              </h1>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Token Name: {isFetchingName ? "Loading..." : tokenName}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
            <div className="bg-card/50 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Mint New NFT</h2>
              <MintForm />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <MdSignalWifiStatusbarConnectedNoInternet className="size-20 text-blue-500 z-50" />
          <p className="text-lg font-normal text-blue-500">
            No account connected
          </p>
        </div>
      )}
    </Wrapper>
  );
}