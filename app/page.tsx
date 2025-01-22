'use client'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {Connection,Keypair, Transaction, PublicKey} from "@solana/web3.js";
import {getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import React, {useState} from 'react'
import * as dotenv from 'dotenv'

import * as anchor from "@project-serum/anchor";
import idl from "../IDL/token_transfer.json";




const PROGRAM_ID = new PublicKey("8bwdvGP6bdPTRLRn6fFbybrwpTkC9A2RiWHroQG2hUCN")

const TokenTransfer: React.FC = () => {

    const senderWalletAddress = new PublicKey("KJB956DNDTJaVXFREGLXhSQXuQZLvp8ZCGzLPh4TexM")

    const [receiver, setReceiver] = useState('');
    const [_amount, setAmount] = useState('');
    const [tokenMint, setTokenMint] = useState('');
    const [transactionStatus, setTransactionStatus] = useState('');

    async function getSenderKeypair() {
        const response = await fetch("/api/get-keypair");
        const keypairJson = await response.json();
        return Keypair.fromSecretKey(Uint8Array.from(keypairJson));
      }


    const transferTokens = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(!receiver || !_amount) {
            alert('Please fill out all fields!');
            return;
        }

        try {
            const { solana } = window as any;
            const recipient = new PublicKey(receiver);
            const mintAddress = new PublicKey(tokenMint);
            const amountToTransfer = parseFloat(_amount) * 10 ** 6;
            const amount = new anchor.BN(amountToTransfer);

            //Define the accounts
            const senderTokenAccount = await getAssociatedTokenAddress(mintAddress, senderWalletAddress, true, TOKEN_PROGRAM_ID);
            const recipientTokenAccount = await getAssociatedTokenAddress(mintAddress, recipient, true, TOKEN_PROGRAM_ID);

            console.log(senderTokenAccount)

            //Create a connection to the Solana cluster
            const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");

            //Set up the Anchor provider
            const provider = new anchor.AnchorProvider(connection, solana, anchor.AnchorProvider.defaultOptions());

            //Load the Program
            const program = new anchor.Program(idl as unknown as anchor.Idl, PROGRAM_ID, provider);

            
            console.log(mintAddress.toString());

            const mintAccountInfo = await connection.getAccountInfo(mintAddress);
            console.log(mintAccountInfo?.owner.toString());

            console.log(TOKEN_PROGRAM_ID.toString());

            //Call the `transfer_tokens` functionanchor
            const transaction = await program.methods
                .transferTokens(amount)
                .accounts({
                    fromAccount: senderTokenAccount,
                    toAccount: recipientTokenAccount,
                    target: recipient,
                    mint: mintAddress,
                    authority: senderWalletAddress,
                    tokenProgram: TOKEN_PROGRAM_ID
                })
                .rpc();

            console.log("Transaction Signature:", transaction);

            await connection.confirmTransaction(transaction, "finalized");
            console.log("Transaction successfully confirmed!");

           
        } catch (error) {
            alert(error)
            console.error('Error transferring tokens:', error);
        }
    }

    return(
        <div style={{padding: '20px', maxWidth: '500px', margin: 'auto'}}>
            <h1>Transfer SPL Token</h1>
            <div style={{marginBottom: '10px'}}>
                <label>Token Mint Address:</label>
                <input type="text" placeholder="Token Mint Address" value={tokenMint} onChange={(e) => setTokenMint(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}></input>
            </div>
            <div style={{marginBottom: '10px'}}>
                <label>Recipient Address</label>
                <input type="text" placeholder="Recipient Address" value={receiver} onChange={(e) => setReceiver(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}></input>
            </div>
            <div style={{marginBottom: '10px'}}>
                <label>Amount:</label>
                <input type="number" placeholder="Amount" value={_amount} onChange={(e) => setAmount(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}></input>
            </div>
            <button
                onClick={transferTokens}
                style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: 'pointer',
                }}>Transfer Tokens</button>

            {transactionStatus && <p style={{marginTop: '10px'}}>{transactionStatus}</p>}
            
        </div>
    )
}

export default TokenTransfer;