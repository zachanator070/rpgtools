import React, {useEffect, useState} from 'react';
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import PrimaryButton from "../widgets/PrimaryButton";
import useLogout from "../../hooks/authentication/useLogout";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import LoadingView from "../LoadingView";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import useServerConfig from "../../hooks/server/useServerConfig";
import { NavComponent } from './NavBar';

export default function getLoginOptions(): NavComponent[] {

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
        return [{ key: 'loading', component: <LoadingView/> }];
    }

    const ssoConfigured = !!serverConfig?.ssoConfigured;
    const loggedIn = currentUser.username !== ANON_USERNAME;
    const options: NavComponent[] = [];

    if(loggedIn) {
        options.push({
            key: 'logout',
            component: <PrimaryButton id="logoutButton" onClick={async () => logout()}>Logout</PrimaryButton>
        });
    } else {
        options.push({
            key: 'login',
            component: <>
                <LoginModal
                    setVisibility={async (visibility: boolean) => setLoginModalVisibility(visibility)}
                    visibility={loginModalVisibility}
                    ssoConfigured={ssoConfigured}
                />
                <a href="#" onClick={async () => setLoginModalVisibility(true)}>Login</a>
            </>
        });
        options.push({
            key: 'register',
            component: <>
                <RegisterModal
                    setVisibility={async (visibility: boolean) => setRegisterModalVisibility(visibility)}
                    visibility={registerModalVisibility}
                    ssoConfigured={ssoConfigured}
                />
                <a href="#" onClick={async () => setRegisterModalVisibility(true)}>Register</a>
            </>
        });
    }

    return options;
}