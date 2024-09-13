import React from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.js";
import ColumnedContent from "../widgets/ColumnedContent.js";
import RenameWorldForm from "./RenameWorldForm.js";
import WorldPermissionsEditor from "./WorldPermissionsEditor.js";
import Load5eContentForm from "./Load5eContentForm.js";
import CalendarList from "./calendar/CalendarList.js";

export default function WorldSettings() {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();

	if (currentWorldLoading) {
		return <LoadingView />;
	}

	if (!currentWorld) {
		return <div>404 - World not found</div>;
	}

	return (
		<div className="margin-md-left margin-md-top padding-lg-bottom">
			<h1>Settings for {currentWorld.name}</h1>
			<hr />

			<ColumnedContent className={"margin-lg-top margin-lg-bottom"} childrenSizes={['25%', '50%', '25%']}>
				<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
					<WorldPermissionsEditor/>

					{currentWorld.canWrite && (
						<>
							<div className={"margin-lg-top"}>
								<RenameWorldForm/>
							</div>
							<div className={"margin-lg-top"}>
								<Load5eContentForm/>
							</div>
						</>
					)}
					<div className={"margin-lg-top"}>
						<CalendarList/>
					</div>
				</div>
			</ColumnedContent>

		</div>
	);
};
