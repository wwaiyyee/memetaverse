// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MemeRegistry {

    uint256 private nextId = 1;

    struct Meme {
        uint256 id;
        string title;
        string cid;          // IPFS hash from Pinata
        string description;  // origin story / explanation
        string country;
        string category;
        string originDate;
        int256 latitude;
        int256 longitude;
        address uploader;
        uint256 createdAt;
    }

    mapping(uint256 => Meme) private memes;
    uint256[] private memeIds;

    // =========================
    // EVENTS
    // =========================
    event MemeCreated(
        uint256 indexed id,
        string title,
        string cid,
        address indexed uploader
    );

    // =========================
    // CREATE MEME (WRITE)
    // =========================
    function createMeme(
        string memory _title,
        string memory _cid,
        string memory _description,
        string memory _country,
        string memory _category,
        string memory _originDate,
        int256 _latitude,
        int256 _longitude
    ) external returns (uint256) {

        uint256 memeId = nextId++;

        memes[memeId] = Meme({
            id: memeId,
            title: _title,
            cid: _cid,
            description: _description,
            country: _country,
            category: _category,
            originDate: _originDate,
            latitude: _latitude,
            longitude: _longitude,
            uploader: msg.sender,
            createdAt: block.timestamp
        });

        memeIds.push(memeId);

        emit MemeCreated(memeId, _title, _cid, msg.sender);

        return memeId;
    }

    // =========================
    // GET SINGLE MEME
    // =========================
    function getMeme(uint256 _id)
        external
        view
        returns (Meme memory)
    {
        require(_id > 0 && _id < nextId, "Meme does not exist");
        return memes[_id];
    }

    // =========================
    // GET ALL MEMES (FOR MAP)
    // =========================
    function getAllMemes()
        external
        view
        returns (Meme[] memory)
    {
        Meme[] memory allMemes = new Meme[](memeIds.length);

        for (uint256 i = 0; i < memeIds.length; i++) {
            allMemes[i] = memes[memeIds[i]];
        }

        return allMemes;
    }

    // =========================
    // TOTAL COUNT
    // =========================
    function getTotalMemes()
        external
        view
        returns (uint256)
    {
        return memeIds.length;
    }
}
