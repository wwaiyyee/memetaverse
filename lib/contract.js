export const MEME_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_MEME_REGISTRY_ADDRESS;

export const MEME_REGISTRY_ABI = [
  "function createMeme(string _title, string _cid, string _description, string _country, string _category, string _originDate, int256 _latitude, int256 _longitude) external returns (uint256)",
  "function getAllMemes() external view returns (tuple(uint256 id, string title, string cid, string description, string country, string category, string originDate, int256 latitude, int256 longitude, address uploader, uint256 createdAt)[])",
  "function getMeme(uint256 _id) external view returns (tuple(uint256 id, string title, string cid, string description, string country, string category, string originDate, int256 latitude, int256 longitude, address uploader, uint256 createdAt))",
  "function getTotalMemes() external view returns (uint256)",
  "event MemeCreated(uint256 indexed id, string title, string cid, address indexed uploader)"
];
