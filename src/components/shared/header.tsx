import { MdOutlineWaterDrop } from "react-icons/md";
import { TbPlugConnectedX } from "react-icons/tb";
import { Loader } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { web3Config } from "../../config/web3.config";
import Wrapper from "./wrapper";

export default function Header() {
  const { status } = useAccount({
    config: web3Config,
  });

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/20 border-b border-white/10">
      <Wrapper className="flex items-center h-20 px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MintMaster
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-10">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
              ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : ''}`
            }
          >
            Gallery
          </NavLink>
          <NavLink
            to="/mint"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
              ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : ''}`
            }
          >
            Mint NFT
          </NavLink>
          <NavLink
            to="/rewards"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}
              ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-purple-500' : ''}`
            }
          >
            Rewards
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {/* Status Indicator */}
          {status === "connected" ? (
            <Link
              to="https://console.optimism.io/faucet"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-500/20 rounded-full text-sm font-medium text-green-400 transition-colors hover:from-green-500/20 hover:to-green-500/30"
            >
              <MdOutlineWaterDrop className="w-4 h-4" />
              <span className="hidden sm:block">Lisk Sepolia Faucet</span>
            </Link>
          ) : status === "connecting" || status === "reconnecting" ? (
            <p className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/20 rounded-full text-sm font-medium text-blue-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="hidden sm:block capitalize">{status}...</span>
            </p>
          ) : (
            <p className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-500/20 rounded-full text-sm font-medium text-red-400">
              <TbPlugConnectedX className="w-4 h-4" />
              <span className="hidden sm:block">No account connected</span>
            </p>
          )}

          {/* Connect Wallet Button */}
          <ConnectKitButton
            showBalance
            showAvatar={true}
          />
        </div>
      </Wrapper>
    </header>
  );
}