import { useState } from 'react';
import { useMidnight } from './hooks/useMidnight';
import { Layout, type ActiveTab } from './components/Layout';
import { WalletConnect } from './components/WalletConnect';
import { PropertyMarketplace } from './components/PropertyMarketplace';
import { Portfolio } from './components/Portfolio';
import { OwnershipProof } from './components/OwnershipProof';
import { ComplianceProof } from './components/ComplianceProof';
import { ProofVerifier } from './components/ProofVerifier';
import type { PropertyMetadata } from './utils/contract';

export function App() {
  const midnight = useMidnight();
  const [activeTab, setActiveTab] = useState<ActiveTab>('marketplace');
  const [selectedProperty, setSelectedProperty] = useState<PropertyMetadata | null>(null);

  const handleSelectPropertyForProof = (
    property: PropertyMetadata,
    type: 'ownership' | 'compliance' | 'rental'
  ) => {
    setSelectedProperty(property);
    if (type === 'ownership') {
      setActiveTab('ownership');
    } else if (type === 'compliance') {
      setActiveTab('compliance');
    } else {
      setActiveTab('ownership');
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      walletStatus={midnight.status}
      shieldedAddress={midnight.shieldedAddress}
      networkId={midnight.networkId}
    >
      <div className="space-y-8">
        {/* Wallet Connection Bar */}
        <WalletConnect
          status={midnight.status}
          walletName={midnight.walletName}
          walletIcon={midnight.walletIcon}
          shieldedAddress={midnight.shieldedAddress}
          networkId={midnight.networkId}
          error={midnight.error}
          onConnect={midnight.connectWallet}
          onDisconnect={midnight.disconnectWallet}
        />

        {/* Tab Content */}
        {activeTab === 'marketplace' && (
          <PropertyMarketplace
            properties={midnight.properties}
            onSelectPropertyForProof={handleSelectPropertyForProof}
          />
        )}

        {activeTab === 'portfolio' && (
          <Portfolio
            properties={midnight.properties}
            portfolio={midnight.portfolio}
            onUpdateHolding={midnight.updateHolding}
            onSelectPropertyForProof={handleSelectPropertyForProof}
          />
        )}

        {activeTab === 'ownership' && (
          <OwnershipProof
            properties={midnight.properties}
            selectedProperty={selectedProperty}
            portfolio={midnight.portfolio}
            isGenerating={midnight.isProofGenerating}
            proofStatus={midnight.currentProofStatus}
            onSelectProperty={setSelectedProperty}
            onGenerateProof={midnight.proveOwnership}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceProof
            properties={midnight.properties}
            selectedProperty={selectedProperty}
            portfolio={midnight.portfolio}
            isGenerating={midnight.isProofGenerating}
            proofStatus={midnight.currentProofStatus}
            onSelectProperty={setSelectedProperty}
            onGenerateProof={midnight.proveCompliance}
          />
        )}

        {activeTab === 'verifier' && (
          <ProofVerifier verificationHistory={midnight.verificationHistory} />
        )}
      </div>
    </Layout>
  );
}

export default App;
