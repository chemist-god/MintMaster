import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import Wrapper from "@/components/shared/wrapper";
import { getName } from "@/services/serviceFn";
import { truncateAddr } from "@/lib/utils";
import { MdSignalWifiStatusbarConnectedNoInternet } from "react-icons/md";
import NFTGallery from "@/components/nft/nft-gallery";

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
    <Wrapper className="min-h-[calc(100vh-80px)] py-10 relative">
      {isConnected ? (
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Welcome, {truncateAddr(address)}
              </h1>
              <p className="text-sm text-gray-400">
                Token Name: {isFetchingName ? "Loading..." : tokenName}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-1">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-8">NFT Gallery</h2>
                <NFTGallery />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
            <MdSignalWifiStatusbarConnectedNoInternet className="relative w-24 h-24 text-blue-500" />
          </div>
          <p className="text-xl font-medium text-blue-500">
            Connect your wallet to view NFTs
          </p>
        </div>
      )}
    </Wrapper>
  );
}