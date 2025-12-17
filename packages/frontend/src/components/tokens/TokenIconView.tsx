import React from 'react';
import TokenList from './TokenList';
import CreateTokenForm from './CreateTokenForm';
import useCurrentWorld from '../../hooks/world/useCurrentWorld';
import BulkCreateTokenForm from './BulkCreateTokenForm';

export default function TokenIconView() {
    const [selectedToken, setSelectedToken] = React.useState(null);
    const {currentWorld} = useCurrentWorld();
    return (
        <div style={{margin: "3rem", display: "flex", gap: "3rem", flexDirection: "row"}}>
            <div>
                {currentWorld && currentWorld.canCreateTokens && (
                    <>
                        <h1>Create Token</h1>
                        <CreateTokenForm/>
                        <h1>Bulk Upload</h1>
                        <BulkCreateTokenForm/>
                    </>
                )}
                <h2>View Tokens</h2>
                <TokenList
                    onSelect={(token) => {
                        setSelectedToken(token);
                    }}
                />
            </div>
            <div>
                <h1>Token Preview</h1>
                {selectedToken ? (
                    <div>
                        <h2>{selectedToken.name || "Unnamed"}</h2>
                        <img
                            src={`/images/${selectedToken.image.icon.chunks[0].fileId}`}
                            alt={selectedToken.name || "Token Icon"}
                            style={{ width: 100, height: 100, objectFit: "contain" }}
                        />
                    </div>
                ) : (
                    <div>Select a token to see its preview</div>
                )}
            </div>
        </div>
    );
}