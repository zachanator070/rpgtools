import React from "react";
import PermissionEditor from "../permissions/PermissionEditor.tsx";
import FullScreenModal from "../widgets/FullScreenModal.tsx";

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

	const subjectName = subject.name;

	return (
		<FullScreenModal
			visible={visibility}
			title={`Permissions for ${subjectName}`}
			setVisible={setVisibility}
			width={'60em'}
		>
			<PermissionEditor
				subject={subject}
				subjectType={subjectType}
				refetch={async () => {await refetch()}}
			/>
		</FullScreenModal>
	);
};
