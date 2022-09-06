import React from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import useCreateGame from "../../hooks/game/useCreateGame";
import useJoinGame from "../../hooks/game/useJoinGame";
import { Link, useHistory } from "react-router-dom";
import useMyGames from "../../hooks/game/useMyGames";
import PasswordInput from "../widgets/input/PasswordInput";
import TextInput from "../widgets/input/TextInput";
import ItemList from "../widgets/ItemList";
import InputForm from "../widgets/input/InputForm";
import FormItem from "../widgets/input/FormItem";
import ColumnedContent from "../widgets/ColumnedContent";

export default function GameLoginView() {
	const history = useHistory();

	const { currentWorld, loading } = useCurrentWorld();
	const { myGames, loading: myGamesLoading, refetch } = useMyGames();

	const { createGame, loading: createGameLoading, errors: createGameErrors } = useCreateGame(
		async (data) => {
			await refetch();
			history.push(`/ui/world/${currentWorld._id}/game/${data.createGame._id}`);
		}
	);
	const { joinGame, loading: joinGameLoading, errors: joinGameErrors } = useJoinGame(async (data) => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/game/${data.joinGame._id}`);
	});

	if (loading || myGamesLoading) {
		return <LoadingView />;
	}

	const links = myGames.map(game => <Link
		key={game._id}
		to={`/ui/world/${currentWorld._id}/game/${game._id}`}
	>
		${game._id}
	</Link>);

	return (
		<>
			<ColumnedContent>
				<div className={"margin-lg-top margin-lg-bottom"}>
					<h1>My Games</h1>
					<ItemList>
						{links}
					</ItemList>
				</div>
			</ColumnedContent>

			{currentWorld.canHostGame && (
				<ColumnedContent>
					<>
						<h1>Create Game</h1>
						<InputForm
							errors={createGameErrors}
							loading={createGameLoading || joinGameLoading}
							onSubmit={createGame}
						>
							<FormItem label="Password" >
								<PasswordInput name="createPassword" />
							</FormItem>

							<FormItem label="Character Name" >
								<TextInput name="characterName"/>
							</FormItem>
						</InputForm>
					</>
				</ColumnedContent>
			)}
			<ColumnedContent>
				<>
					<h1>Join Game</h1>
					<InputForm
						loading={joinGameLoading || createGameLoading}
						errors={joinGameErrors}
						onSubmit={async ({password, characterName, gameId}) => await joinGame({gameId, password, characterName})}
					>
						<FormItem
							label="Game ID"
							required={true}
						>
							<TextInput name="gameId"/>
						</FormItem>

						<FormItem label="Password">
							<PasswordInput name="password"/>
						</FormItem>

						<FormItem label="Character Name">
							<TextInput name="characterName"/>
						</FormItem>
					</InputForm>
				</>
			</ColumnedContent>
		</>
	);
};
