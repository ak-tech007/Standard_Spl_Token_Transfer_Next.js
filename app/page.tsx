'use client'
import React, {useState} from 'react'
import TokenTransfer from "@/components/TokenTransfer";
import WalletModal from '@/components/WalletModal';

const Home: React.FC = () => {


    return(
        <>
        <WalletModal />
        <TokenTransfer />
        </>
    )
}

export default Home;