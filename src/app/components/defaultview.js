
import React from 'react';
import {withRouter} from 'react-router-dom';
import WorldSelectPrompt from "./prompts/worldselectprompt";

export const DefaultView = withRouter(() => {

	return (<WorldSelectPrompt/>);
});