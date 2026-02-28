import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { EmailService } from "./email-service.js";
import path from "path";
import { existsSync } from "fs";
import Logger from "../logging/logger.js";

@injectable()
export class InviteEmailService {
	@inject(INJECTABLE_TYPES.EmailService)
	emailService: EmailService;

	@inject(INJECTABLE_TYPES.Logger)
	logger: Logger;

	private appBaseUrl = process.env.RPGTOOLS_PUBLIC_URL || "https://rpgtools.thezachcave.com";

	private resolveBrandingAssetPath = (assetFileName: string): string | undefined => {
		const candidates = [
			path.resolve(process.cwd(), "packages/frontend/src/branding", assetFileName),
			path.resolve(process.cwd(), "../frontend/src/branding", assetFileName),
			path.resolve(process.cwd(), "../../frontend/src/branding", assetFileName),
			path.resolve(process.cwd(), "src/branding", assetFileName),
			path.resolve(process.cwd(), "docs/images", assetFileName),
		];

		for (const candidate of candidates) {
			if (existsSync(candidate)) {
				return candidate;
			}
		}
	};

	private buildRegistrationUrl = (invitedEmail: string): string => {
		const registerUrl = new URL("/ui/", this.appBaseUrl);
		registerUrl.searchParams.set("register", "1");
		registerUrl.searchParams.set("invite", invitedEmail);
		return registerUrl.toString();
	};

	sendInviteEmail = async (invitedEmail: string, inviterUsername?: string): Promise<void> => {
		if (!this.emailService.isConfigured()) {
			this.logger.warn("Invite email was not sent because SMTP is not configured");
			return;
		}

		const registrationUrl = this.buildRegistrationUrl(invitedEmail);
		const inviter = inviterUsername?.trim() || "an RPG Tools admin";
		const logoPath = this.resolveBrandingAssetPath("RPG-tools-logo-horizontal.png");

		if (!logoPath) {
			this.logger.warn("Branding asset could not be found: RPG-tools-logo-horizontal.png");
		}

		await this.emailService.sendEmail({
			to: invitedEmail,
			subject: "You have been invited to RPG Tools",
			text: `You have been invited to RPG Tools by ${inviter}. Register here: ${registrationUrl}`,
			html: `
				<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; max-width: 640px; margin: 0 auto; padding: 24px;">
					${logoPath ? `
						<div style="text-align: center; margin-bottom: 24px;">
							<img src="cid:rpgtools-logo" alt="RPG Tools" style="max-width: 320px; width: 100%; height: auto;" />
						</div>
					` : ""}
					<h2 style="margin: 0 0 12px;">You're invited to RPG Tools</h2>
					<p style="margin: 0 0 16px;">${inviter} invited you to join RPG Tools.</p>
					<p style="margin: 0 0 24px;">Use the button below to open registration. It will open the register modal automatically.</p>
					<div style="margin: 0 0 24px; text-align: center;">
						<a href="${registrationUrl}" style="display: inline-block; background: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Register for RPG Tools</a>
					</div>
					<p style="margin: 0 0 8px;">Or copy this link into your browser:</p>
					<p style="word-break: break-all; margin: 0;"><a href="${registrationUrl}">${registrationUrl}</a></p>
				</div>
			`,
			attachments: logoPath ? [
				{
					filename: "RPG-tools-logo-horizontal.png",
					path: logoPath,
					cid: "rpgtools-logo",
				}
			] : [],
		});
	};
}
