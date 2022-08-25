import React from "react";
import PermissionEditor from "../permissions/PermissionEditor";
import FullScreenModal from "../widgets/FullScreenModal";

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
		<FullScreenModal
			visible={visibility}
			title={`Permissions for ${subjectName}`}
			setVisible={setVisibility}
		>
			<PermissionEditor
				subject={subject}
				subjectType={subjectType}
				refetch={async () => {await refetch()}}
			/>
		</FullScreenModal>
	);
};
