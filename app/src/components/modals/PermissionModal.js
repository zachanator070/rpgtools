import React from 'react';
import {Modal} from "antd";
import usePermissionModalVisibility from "../../hooks/usePermissionModalVisibility";
import useSetPermissionModalVisibility from "../../hooks/useSetPermissionModalVisibility";
import PermissionEditor from "../permissions/PermissionEditor";
import usePermissionEditorSubject from "../../hooks/usePermissionEditorSubject";
import usePermissionEditorSubjectType from "../../hooks/usePermissionEditorSubjectType";

export const PermissionModal = () => {

	const {permissionModalVisibility} = usePermissionModalVisibility();
	const {setPermissionModalVisibility} = useSetPermissionModalVisibility();

	const {permissionEditorSubject: subject} = usePermissionEditorSubject();
	const {permissionEditorSubjectType: subjectType} = usePermissionEditorSubjectType();

	if(subject === null || subjectType === null){
		return <></>;
	}

	let subjectName = subject.name;

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

