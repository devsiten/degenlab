'use client';

import { FC, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Rocket, 
  Twitter, 
  Globe,
  MessageCircle,
  Info,
  Sparkles,
  X
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  getGlobalPDA,
  getMintAuthorityPDA,
  getBondingCurvePDA,
  getMetadataPDA,
  getEventAuthorityPDA,
  buildCreateInstructionData,
} from '@/lib/pumpfun';
import {
  PUMP_PROGRAM_ID,
  METAPLEX_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  RENT_PROGRAM_ID,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export const CreateTokenForm: FC = () => {
  const router = useRouter();
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { addNotification } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addNotification({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload a JPG, PNG, GIF, or WebP image',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      addNotification({
        type: 'error',
        title: 'File too large',
        message: 'Image must be less than 5MB',
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // For now, return a placeholder URL
    // In production, you'd upload to IPFS via Pinata, NFT.Storage, or your own service
    // This is where you'd integrate with your backend API
    
    // Simulated IPFS upload
    const formData = new FormData();
    formData.append('file', file);

    // Replace with actual IPFS upload
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();
    // return data.uri;

    // Placeholder - returns base64 for demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const createMetadataJson = async (imageUri: string): Promise<string> => {
    const metadata = {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description || `${formData.name} - Created on DegenLab`,
      image: imageUri,
      showName: true,
      createdOn: 'https://degenlab.io',
      twitter: formData.twitter || undefined,
      telegram: formData.telegram || undefined,
      website: formData.website || undefined,
    };

    // In production, upload this JSON to IPFS and return the URI
    // For now, we'll create a data URI
    const jsonString = JSON.stringify(metadata);
    const base64 = btoa(jsonString);
    return `data:application/json;base64,${base64}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey || !signTransaction) {
      addNotification({
        type: 'error',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to create a token',
      });
      return;
    }

    if (!formData.name || !formData.symbol) {
      addNotification({
        type: 'error',
        title: 'Missing required fields',
        message: 'Please enter a name and symbol for your token',
      });
      return;
    }

    if (!imageFile) {
      addNotification({
        type: 'error',
        title: 'Missing image',
        message: 'Please upload an image for your token',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload image to IPFS
      addNotification({
        type: 'info',
        title: 'Uploading image...',
        message: 'Please wait while we upload your image',
      });
      
      const imageUri = await uploadToIPFS(imageFile);

      // 2. Create and upload metadata JSON
      const metadataUri = await createMetadataJson(imageUri);

      // 3. Generate new mint keypair
      const mintKeypair = Keypair.generate();

      // 4. Get all PDAs
      const globalPDA = getGlobalPDA();
      const mintAuthority = getMintAuthorityPDA();
      const bondingCurvePDA = getBondingCurvePDA(mintKeypair.publicKey);
      const metadataPDA = getMetadataPDA(mintKeypair.publicKey);
      const eventAuthority = getEventAuthorityPDA();
      const associatedBondingCurve = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        bondingCurvePDA,
        true
      );

      // 5. Build create instruction
      const instructionData = buildCreateInstructionData(
        formData.name,
        formData.symbol,
        metadataUri
      );

      const transaction = new Transaction().add({
        programId: PUMP_PROGRAM_ID,
        keys: [
          { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: mintAuthority, isSigner: false, isWritable: false },
          { pubkey: bondingCurvePDA, isSigner: false, isWritable: true },
          { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
          { pubkey: globalPDA, isSigner: false, isWritable: false },
          { pubkey: METAPLEX_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: metadataPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: RENT_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: eventAuthority, isSigner: false, isWritable: false },
          { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: instructionData,
      });

      // 6. Set blockhash and sign
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Partial sign with mint keypair
      transaction.partialSign(mintKeypair);

      // Sign with wallet
      const signedTx = await signTransaction(transaction);

      // 7. Send and confirm
      addNotification({
        type: 'info',
        title: 'Creating token...',
        message: 'Please confirm the transaction in your wallet',
      });

      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      addNotification({
        type: 'success',
        title: 'Token Created! 🎉',
        message: `Your token ${formData.symbol} has been created successfully!`,
        txSignature: signature,
      });

      // Redirect to token page
      router.push(`/token/${mintKeypair.publicKey.toString()}`);
    } catch (error: any) {
      console.error('Create token error:', error);
      addNotification({
        type: 'error',
        title: 'Failed to create token',
        message: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Token Image *
        </label>
        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Token preview"
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-primary-500/50"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-600 hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-300/50"
              >
                <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-xs text-gray-500">Upload</span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-dark-300 hover:bg-dark-200 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, GIF or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          Token Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Degen Coin"
              maxLength={32}
              className="w-full px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="e.g., DEGEN"
              maxLength={10}
              className="w-full px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell everyone about your token..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.description.length}/500
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent-cyan" />
          Social Links (Optional)
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-300 rounded-lg">
              <Twitter className="w-5 h-5 text-blue-400" />
            </div>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="https://twitter.com/yourtoken"
              className="flex-1 px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-300 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              placeholder="https://t.me/yourtoken"
              className="flex-1 px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-300 rounded-lg">
              <Globe className="w-5 h-5 text-primary-400" />
            </div>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourtoken.com"
              className="flex-1 px-4 py-3 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-primary-400 mb-1">How it works</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Your token will launch with a bonding curve</li>
              <li>• Total supply: 1 billion tokens</li>
              <li>• First buyer pays ~0.02 SOL creation fee</li>
              <li>• Token graduates to DEX at ~$69K market cap</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {connected ? (
        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.symbol || !imageFile}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-purple hover:from-primary-600 hover:to-accent-purple/90 text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Token...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Launch Token
            </>
          )}
        </button>
      ) : (
        <WalletMultiButton className="!w-full !justify-center !py-4 !rounded-xl !font-bold !text-lg" />
      )}
    </form>
  );
};
