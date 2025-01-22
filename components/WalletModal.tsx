"use client"

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { BalanceAtom, WalletAddress } from "@/Store/WalletAtom";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export default function WalletModal () {

    const [balance, setBalance] = useAtom(BalanceAtom);
    const [walletAddress, setWalletAddress] = useAtom(WalletAddress);

    const connectWallet = async () => {
        try {
            const {solana} = window as any;
            if(solana) {
                const response = await solana.connect();
                const _publickey = response.publicKey.toString();
                setWalletAddress(_publickey); 
                const connection = new Connection(DEVNET_ENDPOINT);
                const _balance = await connection.getBalance(new PublicKey(_publickey));
                setBalance(_balance / LAMPORTS_PER_SOL)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const disconnectWallet = async () => {
        setWalletAddress(null);
        setBalance(null);
    }

    useEffect(() => {(
        async () => {
            try {
                const {solana} = window as any;
                if (solana?.isPhantom) {
                    const response = await solana.connect();
                    const _publickey = response.publicKey.toString();
                    setWalletAddress(_publickey); 
                    const connection = new Connection(DEVNET_ENDPOINT);
                    const _balance = await connection.getBalance(new PublicKey(_publickey));
                    setBalance(_balance / LAMPORTS_PER_SOL)
                }
            } catch (error) {
                console.log(error)
            }
        }) ()
    },[])
    return(
        <>
        <div className=" pt-14 pb-10 flex flex-col items-center gap-2">
            {!walletAddress? (
                <button className="py-3 px-3 rounded-md bg-orange-300 text-lg text-black" onClick={connectWallet}>Wallet Connect</button>) : 
                (<>
                <p>{walletAddress.slice(0,4)}...{walletAddress.slice(-4)}</p>
                <p>{balance} SOL</p>
                <button className="py-3 px-3 rounded-md bg-orange-300 text-lg text-black" onClick={disconnectWallet}>Disconnect Wallet</button>
                </>)}
        </div>
        </>
    )
}