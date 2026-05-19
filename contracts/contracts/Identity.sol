// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Identity is Ownable, ReentrancyGuard {
    struct User {
        string did;
        bool isRegistered;
        address wallet;
    }

    struct Document {
        string docHash;
        string docType;
        uint256 uploadedAt;
        bool isVerified;
    }

    mapping(address => User) public users;
    mapping(address => Document[]) public userDocuments;
    mapping(address => mapping(address => bool)) public verifierAccess;

    event UserRegistered(address indexed userAddress, string did);
    event DocumentUploaded(address indexed userAddress, string docHash, string docType);
    event AccessGranted(address indexed userAddress, address indexed verifier);
    event AccessRevoked(address indexed userAddress, address indexed verifier);
    event DocumentVerified(address indexed userAddress, string docHash, address indexed verifier);

    constructor() Ownable(msg.sender) {}

    function registerUser(string memory _did) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User({
            did: _did,
            isRegistered: true,
            wallet: msg.sender
        });
        emit UserRegistered(msg.sender, _did);
    }

    function uploadDocument(string memory _docHash, string memory _docType) external {
        require(users[msg.sender].isRegistered, "User not registered");
        userDocuments[msg.sender].push(Document({
            docHash: _docHash,
            docType: _docType,
            uploadedAt: block.timestamp,
            isVerified: false
        }));
        emit DocumentUploaded(msg.sender, _docHash, _docType);
    }

    function grantAccess(address _verifier) external {
        require(users[msg.sender].isRegistered, "User not registered");
        verifierAccess[msg.sender][_verifier] = true;
        emit AccessGranted(msg.sender, _verifier);
    }

    function revokeAccess(address _verifier) external {
        require(users[msg.sender].isRegistered, "User not registered");
        verifierAccess[msg.sender][_verifier] = false;
        emit AccessRevoked(msg.sender, _verifier);
    }

    function verifyDocument(address _user, uint256 _docIndex) external {
        require(verifierAccess[_user][msg.sender] || msg.sender == owner(), "Not authorized to verify");
        require(_docIndex < userDocuments[_user].length, "Invalid document index");
        
        userDocuments[_user][_docIndex].isVerified = true;
        emit DocumentVerified(_user, userDocuments[_user][_docIndex].docHash, msg.sender);
    }

    function getUserDocuments(address _user) external view returns (Document[] memory) {
        require(msg.sender == _user || verifierAccess[_user][msg.sender] || msg.sender == owner(), "Not authorized to view");
        return userDocuments[_user];
    }
}
