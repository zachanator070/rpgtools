import React from 'react';
import {Modal} from "antd";
import {PermissionEditor} from "../permissions/PermissionEditor";

export const PermissionModal = ({visibility, setVisibility, subject, subjectType}) => {

	if(subject === null || subjectType === null){
		return <></>;
	}

	let subjectName = subject.name;

	return (
		<Modal
			visible={visibility}
			title={`Permissions for ${subjectName}`}
			onCancel={async () => {
				await setVisibility(false);
			}}
			footer={[]}
			width={'750px'}
		>
			<PermissionEditor subject={subject} subjectType={subjectType}/>
		</Modal>
	);
};

