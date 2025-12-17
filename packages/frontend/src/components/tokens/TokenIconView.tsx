import React from 'react';
import TokenList from './TokenList';
import useCurrentWorld from '../../hooks/world/useCurrentWorld';
import LoadingView from '../LoadingView';
import CreateTokenModal from './CreateTokenModal';
import BulkCreateTokenModal from './BulkCreateTokenModal';
import PrimaryButton from '../widgets/PrimaryButton';
import AddFileIcon from '../widgets/icons/AddFileIcon';
import ZipFileIcon from '../widgets/icons/ZipFileIcon';

export default function TokenIconView() {
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [showBulkCreateModal, setShowBulkCreateModal] = React.useState(false);

    const {loading} = useCurrentWorld();
    if (loading) {
        return <LoadingView />;
    }
    return (
        <div style={{margin: "3rem", display: "flex", gap: "1rem", flexDirection: "column", marginBottom: "1rem"}}>
            <div style={{display: "flex", gap: "1rem", justifyContent: "center"}}>
                <PrimaryButton onClick={() => setShowCreateModal(true)}><AddFileIcon/> Create Token</PrimaryButton>
                <PrimaryButton onClick={() => setShowBulkCreateModal(true)}><ZipFileIcon/> Bulk Create Tokens</PrimaryButton>
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                <TokenList allowDelete={true} />
            </div>
            <CreateTokenModal
                visibility={showCreateModal}
                setVisibility={setShowCreateModal}
            />
            <BulkCreateTokenModal
                visibility={showBulkCreateModal}
                setVisibility={setShowBulkCreateModal}
            />
        </div>
    );
}