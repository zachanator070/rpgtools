import React from "react";
import "./HomePage.css";
import logoHorizontal from "../static/images/RPG-tools-logo-horizontal.png";
import logoFavicon from "../static/images/RPG-tools-logo-favicon.png";
import gameVideo from "../static/videos/game.mp4";
import createPersonVideo from "../static/videos/create person.mp4";
import linkVideo from "../static/videos/link.mp4";
import permissionsVideo from "../static/videos/permissions.mp4";

function BrowserVideo({src}: {src: string}) {
	return (
		<div className="home-container">
			<div className="home-row">
				<div className="home-column home-left">
					<span className="home-dot home-dot-red" />
					<span className="home-dot home-dot-yellow" />
					<span className="home-dot home-dot-green" />
				</div>
				<div className="home-column home-middle">
					<input type="text" value="https://rpgtools.com" readOnly />
				</div>
				<div className="home-column home-right">
					<div className="home-float-right">
						<span className="home-bar" />
						<span className="home-bar" />
						<span className="home-bar" />
					</div>
				</div>
			</div>

			<div className="home-content">
				<video autoPlay muted loop playsInline>
					<source src={src} type="video/mp4" />
				</video>
			</div>
		</div>
	);
}

export default function HomePage() {
	return (
		<div className="home-page">
			<div className="home-root">
				<div className="home-side" />
				<div className="home-center">
					<h1>
						<img className="home-logo" alt="rpg tools logo" src={logoHorizontal} />
					</h1>
					<p>
						Write, link, then game with homebrew content
					</p>

					<h2>Create Fantasy Worlds</h2>
					<p className="home-description">Host your own virtual tabletop experience that friends can join and interact with live.</p>
					<BrowserVideo src={gameVideo} />
					<p className="home-attribution">World map generated using <a href="https://azgaar.github.io/Fantasy-Map-Generator/" target="_blank" rel="noreferrer">Azgaar&apos;s Fantasy Map Generator</a></p>

					<h2>Write Pages for People, Places, Items, Monsters</h2>
					<p className="home-description">Easily create and organize wiki pages into a folder structure so that any detail about your world won&apos;t get lost.</p>
					<BrowserVideo src={createPersonVideo} />
					<p className="home-attribution">Character art generated using <a href="http://dmheroes.com/" target="_blank" rel="noreferrer">dmheros.com</a></p>

					<h2>Link Pages to Maps</h2>
					<p className="home-description">Place map pins for any wiki page to show where they are in relation to everything else in your setting.</p>
					<BrowserVideo src={linkVideo} />
					<p className="home-attribution">Nighchester map generated using <a href="https://watabou.itch.io/medieval-fantasy-city-generator" target="_blank" rel="noreferrer">Watawatabou&apos;s Medieval Fantasy City Generator</a></p>

					<h2>Manage Permissions to Limit Spoilers</h2>
					<p className="home-description">Define permissions on any wiki page and model so that you can control exactly what is revealed to players.</p>
					<BrowserVideo src={permissionsVideo} />

					<h2>Import and Export Content</h2>
					<p className="home-description">
						Export wiki page folders, content, and models to save for later.
						 A Dungeons and Dragons 5e content archive is available
						 <a href="https://github.com/zachanator070/rpgtools-srd/releases" target="_blank" rel="noreferrer">here</a>
						 to import the SRD basic rules, monsters, and models.
					</p>
					<p className="home-attribution">
						SRD content archive is available through the OGL license <a href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf" target="_blank" rel="noreferrer">here</a>.
					</p>
					<p className="home-attribution">
						Credit goes to mz4520 for creating the monster models and providing them for free under the Creative Commons license. Please check out his work and support him on
						 <a href="https://www.thingiverse.com/mz4250/designs" target="_blank" rel="noreferrer">Thingiverse</a>.
					</p>

					<h2>Self Host a Server for Zero-Cost Games</h2>
					<p className="home-description">Run RPGTools natively on any OS. No web hosting service or subscription required. See details at the <a href="https://github.com/zachanator070/rpgtools" target="_blank" rel="noreferrer">RPGTools github repo</a>.</p>

					<h2>View Demo</h2>
					<p className="home-description">
						Check out the public demo at <a href="https://rpgtools.thezachcave.com/ui/defaultWorld" target="_blank" rel="noreferrer">thezachcave.com</a>
					</p>
				</div>
				<div className="home-side" />
			</div>
		</div>
	);
}
