import { ethers } from "ethers";

const MEME_REGISTRY_ADDRESS = "0x0CC995E04e2fa0380B21286B8Ba9afc4f5aA86af";
const MEME_REGISTRY_ABI = [
  "function getAllMemes() external view returns (tuple(uint256 id, string title, string cid, string description, string country, string category, string originDate, int256 latitude, int256 longitude, address uploader, uint256 createdAt)[])"
];

async function main() {
  const provider = new ethers.JsonRpcProvider("https://monad-testnet.g.alchemy.com/v2/EuLqamhK_5ymLb8952SSc");
  const contract = new ethers.Contract(MEME_REGISTRY_ADDRESS, MEME_REGISTRY_ABI, provider);
  const data = await contract.getAllMemes();
  console.log("Total memes on chain:", data.length);
  console.log("Memes:", data);
}

main().catch(console.error);
