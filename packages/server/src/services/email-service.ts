import { inject, injectable } from "inversify";
import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import Logger from "../logging/logger.js";
import { GenericRpgToolsAPIError, RpgToolsAPIError } from "../errors.js";

export interface EmailMessage {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	attachments?: SendMailOptions["attachments"];
	cc?: SendMailOptions["cc"];
	bcc?: SendMailOptions["bcc"];
}

@injectable()
export class EmailService {
	private transporter: Transporter | null = null;

	private smtpHost = process.env.SMTP_HOST || "";
	private smtpPort = Number(process.env.SMTP_PORT || 587);
	private smtpSecure = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
	private smtpUser = process.env.SMTP_USER || "";
	private smtpPassword = process.env.SMTP_PASSWORD || "";
	private smtpFromEmail = process.env.SMTP_FROM_EMAIL || "";
	private smtpFromName = process.env.SMTP_FROM_NAME || "RPG Tools";
	private logger: Logger;

	constructor(@inject(INJECTABLE_TYPES.Logger) logger: Logger) {
		this.logger = logger;
		this.validateConfiguration();
	}

	private validateConfiguration = (): void => {
		if (!this.smtpHost && !this.smtpUser && !this.smtpPassword && !this.smtpFromEmail) {
			return;
		}

		if (this.smtpHost.startsWith("http://") || this.smtpHost.startsWith("https://") || this.smtpHost.startsWith("smtp://")) {
			this.logger.warn("SMTP_HOST should be a hostname only (for example smtp.gmail.com), not a URL with protocol.");
		}

		if (this.smtpPort === 465 && !this.smtpSecure) {
			this.logger.warn("SMTP configuration mismatch: port 465 usually requires SMTP_SECURE=true.");
		}

		if (this.smtpPort === 587 && this.smtpSecure) {
			this.logger.warn("SMTP configuration mismatch: port 587 usually requires SMTP_SECURE=false (STARTTLS).");
		}

		if (this.smtpPort === 25 && this.smtpSecure) {
			this.logger.warn("SMTP configuration mismatch: port 25 usually requires SMTP_SECURE=false.");
		}
	};

	isConfigured = (): boolean => {
		return !!(this.smtpHost && this.smtpUser && this.smtpPassword && this.smtpFromEmail);
	};

	private getTransporter = (): Transporter => {
		if (!this.transporter) {
			this.transporter = nodemailer.createTransport({
				host: this.smtpHost,
				port: this.smtpPort,
				secure: this.smtpSecure,
				auth: {
					user: this.smtpUser,
					pass: this.smtpPassword,
				},
			});
		}

		return this.transporter;
	};

	sendEmail = async (message: EmailMessage): Promise<void> => {
		if (!this.isConfigured()) {
			throw new GenericRpgToolsAPIError("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_EMAIL.");
		}

		const transporter = this.getTransporter();
		await transporter.sendMail({
			from: `\"${this.smtpFromName}\" <${this.smtpFromEmail}>`,
			to: message.to,
			subject: message.subject,
			html: message.html,
			text: message.text,
			attachments: message.attachments,
			cc: message.cc,
			bcc: message.bcc,
		});
	};
}
