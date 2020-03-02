import React, {Component} from 'react';
import {Button, Checkbox, Modal, Select, Table} from "antd";
import usePermissionModalVisibility from "../../hooks/usePermissionModalVisibility";
import useSetPermissionModalVisibility from "../../hooks/useSetPermissionModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";

export const PermissionModal = () => {

	const {permissionModalVisibility} = usePermissionModalVisibility();
	const {setPermissionModalVisibility} = useSetPermissionModalVisibility();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentWiki, loading: currentWikiLoading} = useCurrentWiki();
	return (
		<Modal
			visible={permissionModalVisibility}
			title="World Permissions"
			onCancel={async () => {
				await setPermissionModalVisibility(false);
			}}
			footer={[]}
		>

		</Modal>
	);
};

