import React from "react";

export default function LegalPage() {
	return (
		<div className="padding-lg" style={{maxWidth: '64rem', margin: '0 auto'}}>
			<h1>Legal</h1>
			<p><strong>Effective date:</strong> March 3, 2026</p>

			<section className="margin-lg-top">
				<h2 id="terms-of-service">Terms of Service</h2>
				<p>
					By using RPG Tools, you agree to these Terms of Service. If you do not agree, do not use the service.
				</p>
				<p>
					You are responsible for activity performed with your account and for maintaining the confidentiality of your login credentials.
				</p>
				<p>
					You may use the service to create and manage campaign content. You must not use the service to violate law,
					infringe intellectual property rights, or distribute malicious, abusive, or unauthorized content.
				</p>
				<p>
					The service may change over time, including features, limits, and availability. We may suspend or terminate access
					for misuse, abuse, or behavior that threatens system integrity or other users.
				</p>
				<p>
					To the maximum extent permitted by law, the service is provided "as is" without warranties of any kind.
					We are not liable for indirect, incidental, special, consequential, or punitive damages, or for data loss,
					even if advised of the possibility of such damages.
				</p>
				<p>
					These terms are governed by applicable law in the jurisdiction where the service operator is located,
					unless a different jurisdiction is required by law.
				</p>
			</section>

			<section className="margin-lg-top">
				<h2 id="privacy-policy">Privacy Policy</h2>
				<p>
					This Privacy Policy describes how RPG Tools collects, uses, and protects your information.
				</p>
				<h3>Information we collect</h3>
				<p>
					We collect account information you provide (such as username and email), authentication-related data,
					and content you create in the app (such as world, map, wiki, model, or game data).
				</p>
				<h3>How we use information</h3>
				<p>
					We use information to provide core functionality, authenticate users, enforce permissions,
					maintain security, and improve service reliability.
				</p>
				<h3>Sharing and disclosure</h3>
				<p>
					We do not sell personal information. We may share data with infrastructure or service providers
					that support operation of the app, or when required by law.
				</p>
				<h3>Retention</h3>
				<p>
					We retain account and application data as needed to operate the service, satisfy legal obligations,
					resolve disputes, and enforce agreements.
				</p>
				<h3>Security</h3>
				<p>
					We use reasonable technical and organizational measures to protect data. No method of transmission
					or storage is completely secure.
				</p>
				<h3>Your choices</h3>
				<p>
					You may request account-related updates or deletion where supported by law and product capabilities.
					You are responsible for managing content visibility and sharing permissions inside your worlds.
				</p>
				<h3>Changes to this policy</h3>
				<p>
					We may update this policy from time to time. Material changes will be reflected by an updated effective date.
				</p>
				<h3>Contact</h3>
				<p>
					For privacy or terms questions, contact the service administrator or project maintainer.
				</p>
			</section>
		</div>
	);
}