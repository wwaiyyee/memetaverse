# memetaverse

> an on-chain archive of internet culture, mapped across the globe.

***

/// what it is ///

**memetaverse** is a Next.js web app that lets anyone explore, upload, and permanently record memes on the blockchain. memes are pinned to their geographic origin on an interactive 3D globe — rendered in Klein Blue with a live heatmap showing cultural density across the world.

every submission is stored on IPFS via Pinata and registered on the **Monad Testnet** smart contract, making each meme's origin, date, and uploader verifiable on-chain forever.

***

/// stack ///

| layer | tech |
|---|---|
| frontend | Next.js 16 · React 19 · Tailwind CSS 4 |
| wallet | wagmi v2 · RainbowKit · viem |
| chain reads | ethers.js v6 |
| storage | Pinata (IPFS) |
| animation | Framer Motion |
| smart contract | Solidity 0.8.28 · Hardhat · Ignition |
| network | Monad Testnet (chain ID 10143) |

***

/// pages ///

**`/`** — globe home
the interactive canvas globe with Klein Blue heatmap. search memes by name or country. upload new memes directly from the landing page. trending atlas panel shows the 5 most recently added memes.

**`/explore?id=`** — meme detail
full story view for any meme. shows description, origin country, date, uploader wallet address, and a live link to the IPFS image via Pinata gateway. on-chain memes show their full record; static memes show curated data.

**`/contribute`** — wallet-gated submission
connect your wallet to submit a meme to the archive. contributions are recorded on-chain via Monad.

**`/history`** — on-chain log
transaction history of all contributions. verifiable on Monad. *(coming soon)*

***

/// smart contract ///

```
MemeRegistry.sol
deployed: 0x0CC995E04e2fa0380B21286B8Ba9afc4f5aA86af
network:  Monad Testnet (chain-10143)
```

each meme stores: `title · cid · description · country · category · originDate · latitude · longitude · uploader · createdAt`

key functions:
- `createMeme(...)` — write a new meme to the registry
- `getMeme(id)` — fetch a single meme by ID
- `getAllMemes()` — fetch all memes (used for globe rendering)
- `getTotalMemes()` — total count

***

/// upload flow ///

```
drag file into upload card
  → fill in title, description, country, category, origin date
  → coordinates auto-resolved from country name via Nominatim
  → file uploaded to IPFS via /api/pinata/upload
  → CID + metadata sent to MemeRegistry contract on Monad
  → meme pin appears on globe immediately
```

supported formats: JPEG · PNG · GIF · WEBP · MP4 · WEBM (up to 100 MB)

***

/// local setup ///

```bash
# install
npm install

# run dev server
npm run dev
```

open `http://localhost:3000`

env vars needed:
```
NEXT_PUBLIC_MEME_REGISTRY_ADDRESS
NEXT_PUBLIC_MONAD_RPC_URL
NEXT_PUBLIC_PINATA_GATEWAY
```

***

/// contract deployment ///

```bash
cd meme-contract
npm install
npx hardhat ignition deploy ignition/modules/MemeRegistry.ts --network monadTestnet
```

***

/// project structure ///

```
memetaverse/
├── components/
│   ├── MemeGlobe.js          canvas globe renderer · Klein Blue heatmap · marker pins
│   ├── FileUploadCard.js     drag-drop upload · metadata form · IPFS + contract write
│   ├── ConnectWallet.js      RainbowKit wallet connector
│   └── Navbar.js             shared nav
├── pages/
│   ├── index.js              home · globe · search · upload
│   ├── explore.js            meme detail view
│   ├── contribute.js         wallet-gated submission page
│   ├── history.js            on-chain contribution log
│   └── api/
│       ├── pinata/upload.js  server-side IPFS upload handler
│       └── memes/            search + identify endpoints
├── lib/
│   ├── contract.js           MemeRegistry ABI + address
│   └── wagmiConfig.js        wagmi + RainbowKit config
├── data/
│   └── memes.js              static seed memes for globe
└── meme-contract/
    └── contracts/
        └── MemeRegistry.sol  on-chain meme registry
```

***
