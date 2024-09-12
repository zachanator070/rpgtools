import React, {useState} from 'react';
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import PrimaryButton from "../widgets/PrimaryButton.tsx";
import useLogout from "../../hooks/authentication/useLogout.js";
import useCurrentUser from "../../hooks/authentication/useCurrentUser.js";
import LoadingView from "../LoadingView.tsx";
import LoginModal from "../modals/LoginModal.tsx";
import RegisterModal from "../modals/RegisterModal.tsx";

export default function LoginOptions() {

    const { logout } = useLogout();
    const { currentUser, loading: userLoading } = useCurrentUser();

    const [loginModalVisibility, setLoginModalVisibility] = useState(false);
    const [registerModalVisibility, setRegisterModalVisibility] = useState(false);

    if(userLoading) {
        return <LoadingView/>;
    }
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
                <LoginModal setVisibility={async (visibility: boolean) => setLoginModalVisibility(visibility)} visibility={loginModalVisibility} />
                <RegisterModal
                    setVisibility={async (visibility: boolean) => setRegisterModalVisibility(visibility)}
                    visibility={registerModalVisibility}
                />
                <div className="text-align-right margin-sm-top ">
                    <a href="#" onClick={async () => setLoginModalVisibility(true)}>
                        Login
                    </a>
                    <span className={"margin-md-left margin-md-right"}>or</span>
                    <a href="#" onClick={async () => setRegisterModalVisibility(true)}>
                        Register
                    </a>
                </div>
            </div>
    }
    </>
}