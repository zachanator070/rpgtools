import React from "react";
import { Modal } from "antd";
import PermissionEditor from "../permissions/PermissionEditor";

interface PermissionModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
	subject: any;
	subjectType: string;
	refetch: () => Promise<any>;
}

export default function PermissionModal({
	visibility,
	setVisibility,
	subject,
	subjectType,
	refetch,
}: PermissionModalProps) {
	if (subject === null || subjectType === null) {
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
			width={"750px"}
		>
			<PermissionEditor
				subject={subject}
				subjectType={subjectType}
			/>
		</Modal>
	);
};
