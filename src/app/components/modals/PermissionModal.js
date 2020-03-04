import React, {useState} from 'react';
import {Radio, Modal, Tabs, List} from "antd";
import usePermissionModalVisibility from "../../hooks/usePermissionModalVisibility";
import useSetPermissionModalVisibility from "../../hooks/useSetPermissionModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {
	WIKI_PERMISSIONS,
	WORLD_PERMISSIONS,
} from "../../../permission-constants";
import PermissionView from "../PermissionView";

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
			<PermissionView/>
		</Modal>
	);
};

