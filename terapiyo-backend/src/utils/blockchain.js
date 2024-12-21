import { ethers } from 'ethers';
import config from '../config/config.js';
import logger from '../config/logger.js';

// Sertifika doğrulama için akıllı kontrat ABI'si
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certificateHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Sertifika verilerini blockchain üzerinde doğrula
 */
export const verifyWithBlockchain = async (certificate) => {
  try {
    // Ethereum ağına bağlan
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    
    // Akıllı kontrat örneği oluştur
    const contract = new ethers.Contract(
      config.blockchain.contractAddress,
      CONTRACT_ABI,
      provider
    );
    
    // Sertifika verilerinden hash oluştur
    const certificateData = `${certificate.issuer}:${certificate.serialNumber}:${certificate.issuedAt}`;
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes(certificateData));
    
    // Blockchain üzerinde doğrula
    const isValid = await contract.verifyCertificate(certificateHash);
    
    return isValid;
  } catch (error) {
    logger.error('Blockchain verification error:', error);
    return false;
  }
};

/**
 * Sertifika verilerini blockchain'e kaydet
 */
export const registerCertificateOnBlockchain = async (certificate) => {
  try {
    // Ethereum ağına bağlan
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    
    // Özel anahtar ile cüzdan oluştur
    const wallet = new ethers.Wallet(config.blockchain.privateKey, provider);
    
    // Akıllı kontrat örneği oluştur
    const contract = new ethers.Contract(
      config.blockchain.contractAddress,
      CONTRACT_ABI,
      wallet
    );
    
    // Sertifika verilerinden hash oluştur
    const certificateData = `${certificate.issuer}:${certificate.serialNumber}:${certificate.issuedAt}`;
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes(certificateData));
    
    // Blockchain'e kaydet
    const tx = await contract.registerCertificate(certificateHash);
    await tx.wait();
    
    return true;
  } catch (error) {
    logger.error('Blockchain registration error:', error);
    return false;
  }
};
