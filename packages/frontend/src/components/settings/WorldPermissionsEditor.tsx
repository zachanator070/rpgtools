import 'react';
import PermissionEditor from "../permissions/PermissionEditor.js";
import {WORLD} from "@rpgtools/common/src/type-constants.js";
import React from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";

export default function () {
    const { currentWorld, refetch } = useCurrentWorld();
    return <div className={"margin-lg-top"}>
        <h2>Permissions</h2>
        <div className={"margin-lg-top"}>
            <PermissionEditor subject={currentWorld} subjectType={WORLD} refetch={async () => {await refetch()}} />
        </div>
    </div>;
}