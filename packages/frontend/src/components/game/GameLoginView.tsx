import React from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import useCreateGame from "../../hooks/game/useCreateGame";
import useJoinGame from "../../hooks/game/useJoinGame";
import { Link, useHistory } from "react-router-dom";
import useMyGames from "../../hooks/game/useMyGames";
import PrimaryButton from "../widgets/PrimaryButton";
import PasswordInput from "../widgets/PasswordInput";
import TextInput from "../widgets/TextInput";
import ItemList from "../widgets/ItemList";
import InputForm from "../widgets/InputForm";
import FormItem from "../widgets/FormItem";

export default function GameLoginView() {
	const history = useHistory();

	const { currentWorld, loading } = useCurrentWorld();
	const { myGames, loading: myGamesLoading, refetch } = useMyGames();

	const { createGame, loading: createGameLoading } = useCreateGame(
		async (data) => {
			await refetch();
			history.push(`/ui/world/${currentWorld._id}/game/${data.createGame._id}`);
		}
	);
	const { joinGame, loading: joinGameLoading } = useJoinGame(async (data) => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/game/${data.joinGame._id}`);
	});

	if (loading || myGamesLoading) {
		return <LoadingView />;
	}

	const links = myGames.map(game => <Link
		to={`/ui/world/${currentWorld._id}/game/${game._id}`}
	>
		${game._id}
	</Link>);

	return (
		<>
			<div style={{display: "flex"}}>
				<div style={{flexGrow: 8}} />
				<div style={{flexGrow: 8}}>
					<div className={"margin-lg-top margin-lg-bottom"}>
						<h1>My Games</h1>
						<ItemList>
							{links}
						</ItemList>
					</div>
				</div>
				<div style={{flexGrow: 8}}/>
			</div>

			{currentWorld.canHostGame && (
				<div style={{display: "flex"}}>
					<div style={{flexGrow: 8}}/>
					<div style={{flexGrow: 8}}>
						<h1>Create Game</h1>
						<InputForm
							initialValues={{
								remember: true,
							}}
							onSubmit={createGame}
						>
							<FormItem label="Password" name="createPassword">
								<PasswordInput />
							</FormItem>

							<FormItem label="Character Name" name="characterName">
								<TextInput />
							</FormItem>

							<FormItem>
								<PrimaryButton
									submit={true}
									disabled={createGameLoading || joinGameLoading}
								>
									Create Game
								</PrimaryButton>
							</FormItem>
						</InputForm>
					</div>
					<div style={{flexGrow: 8}}/>
				</div>
			)}
			<div style={{display: "flex"}}>
				<div style={{flexGrow: 8}}/>
				<div style={{flexGrow: 8}}>
					<h1>Join Game</h1>
					<InputForm
						initialValues={{
							remember: true,
						}}
						onSubmit={joinGame}
					>
						<FormItem
							label="Game ID"
							name="gameId"
							required={true}
						>
							<TextInput />
						</FormItem>

						<FormItem label="Password" name="password">
							<PasswordInput />
						</FormItem>

						<FormItem label="Character Name" name="characterName">
							<TextInput />
						</FormItem>

						<FormItem>
							<PrimaryButton
								submit={true}
								disabled={createGameLoading || joinGameLoading}
							>
								Join Game
							</PrimaryButton>
						</FormItem>
					</InputForm>
				</div>
				<div style={{flexGrow: 8}}/>
			</div>
		</>
	);
};
