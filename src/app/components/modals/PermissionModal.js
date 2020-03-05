import React from 'react';
import {Modal} from "antd";
import usePermissionModalVisibility from "../../hooks/usePermissionModalVisibility";
import useSetPermissionModalVisibility from "../../hooks/useSetPermissionModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import PermissionEditor from "../PermissionEditor";

export const PermissionModal = () => {

	const {permissionModalVisibility} = usePermissionModalVisibility();
	const {setPermissionModalVisibility} = useSetPermissionModalVisibility();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentWiki, loading: currentWikiLoading} = useCurrentWiki();

	let subjectName = null;
	if(currentWiki){
		subjectName = currentWiki.name;
	} else if(currentWorld){
		subjectName = currentWorld.name;
	}

	if(currentWorldLoading || currentWikiLoading){
		return <></>;
	}

	return (
		<Modal
			visible={permissionModalVisibility}
			title={`Permissions for ${subjectName}`}
			onCancel={async () => {
				await setPermissionModalVisibility(false);
			}}
			footer={[]}
			width={'750px'}
		>
			<PermissionEditor/>
		</Modal>
	);
};

