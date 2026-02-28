import React, {useEffect, useState} from 'react';
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import PrimaryButton from "../widgets/PrimaryButton";
import useLogout from "../../hooks/authentication/useLogout";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import LoadingView from "../LoadingView";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import useServerConfig from "../../hooks/server/useServerConfig";

export default function LoginOptions() {

    const { logout } = useLogout();
    const { currentUser, loading: userLoading } = useCurrentUser();
    const { serverConfig, loading: serverConfigLoading } = useServerConfig();

    const [loginModalVisibility, setLoginModalVisibility] = useState(false);
    const [registerModalVisibility, setRegisterModalVisibility] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);
        const registerParam = url.searchParams.get("register");
        if (registerParam !== "1" && registerParam !== "true") {
            return;
        }

        setRegisterModalVisibility(true);
        url.searchParams.delete("register");
        window.history.replaceState({}, "", url.toString());
    }, []);

    if(userLoading || serverConfigLoading) {
        return <LoadingView/>;
    }

    const ssoConfigured = !!serverConfig?.ssoConfigured;
    return <>
        {currentUser.username !== ANON_USERNAME ?
            <span>
				<span className="margin-md-right" id={'userGreeting'}>Hello {currentUser.username}</span>
				<span>
					<PrimaryButton id="logoutButton" onClick={async () => logout()}>
						Logout
					</PrimaryButton>
				</span>
			</span>
        :
            <div>
                <LoginModal
                    setVisibility={async (visibility: boolean) => setLoginModalVisibility(visibility)}
                    visibility={loginModalVisibility}
                    ssoConfigured={ssoConfigured}
                />
                <RegisterModal
                    setVisibility={async (visibility: boolean) => setRegisterModalVisibility(visibility)}
                    visibility={registerModalVisibility}
                    ssoConfigured={ssoConfigured}
                />
                <div className="text-align-right margin-sm-top ">
                    <>
                        <a href="#" onClick={async () => setLoginModalVisibility(true)}>
                            Login
                        </a>
                        <span className={"margin-md-left margin-md-right"}>or</span>
                        <a href="#" onClick={async () => setRegisterModalVisibility(true)}>
                            Register
                        </a>
                    </>
                </div>
            </div>
    }
    </>
}