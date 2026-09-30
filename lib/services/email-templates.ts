import type { EmailMessage, NotificationData, NotificationType } from "@/lib/contracts/email";

type RenderedTemplate = Omit<EmailMessage, "to"> & { type: NotificationType };

function escapeHtml(value: string | undefined | null) {
    return (value ?? "").replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });
}

function appLayout(title: string, content: string, action?: { label: string; url: string }) {
    const button = action
        ? `<p style="margin:28px 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p>`
        : "";

    return `<!doctype html><html><body style="margin:0;background:#fff7ed;color:#431407;font-family:Arial,sans-serif;line-height:1.6"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="border:1px solid #fed7aa;border-radius:10px;overflow:hidden"><div style="background:#ea580c;color:white;padding:20px 24px"><strong>KBU Hackathon 2026</strong></div><div style="background:#ffffff;padding-top:32px !important;padding-right:24px !important;padding-bottom:32px !important;padding-left:24px !important"><h1 style="font-size:22px;margin:0 0 20px;color:#7c2d12">${escapeHtml(title)}</h1>${content}${button}</div><div style="border-top:1px solid #fed7aa;padding:16px 24px;text-align:center"><p style="font-size:12px;color:#9a3412;margin:0">This is an automated message from KBU Hackathon 2026.</p></div></div></div></body></html>`;
}

function paragraph(text: string) {
    return `<p>${text}</p>`;
}

export function renderNotificationTemplate(type: NotificationType, data: NotificationData): RenderedTemplate {
    const rawTeamName = data.teamName ?? "";
    const teamName = escapeHtml(rawTeamName) || "Your team";
    const reason = data.reason ? paragraph(`<strong>Reason:</strong> ${escapeHtml(data.reason)}`) : "";
    const expires = data.expiresAt ? paragraph(`<strong>Until:</strong> ${escapeHtml(data.expiresAt)}`) : "";

    switch (type) {
        case "PASSWORD_RESET": {
            const title = "Reset your password";
            return {
                type,
                subject: "Reset your KBU Hackathon 2026 password",
                text: `Reset your KBU Hackathon 2026 password using this link: ${data.resetUrl}`,
                html: appLayout(title, paragraph("Use the button below to reset your password."), {
                    label: "Reset password",
                    url: data.resetUrl ?? "",
                }),
            };
        }
        case "STUDENT_EMAIL_VERIFICATION": {
            const title = "Verify your student email";
            return {
                type,
                subject: "Verify your KBU Hackathon 2026 student email",
                text: `Verify your student email using this link: ${data.verificationUrl}`,
                html: appLayout(title, paragraph("Please verify your student email address using the button below."), {
                    label: "Verify email",
                    url: data.verificationUrl ?? "",
                }),
            };
        }
        case "TEAM_REGISTRATION_APPROVED": {
            const title = `${rawTeamName || "Your team"} registration approved`;
            const text = `Your team registration has been approved.\n\nTeam: ${rawTeamName || "Not provided"}\n\nSet your team password using this link: ${data.resetUrl}`;
            return {
                type,
                subject: title,
                text,
                html: appLayout(
                    title,
                    paragraph("Your team registration has been approved.") +
                        paragraph(`<strong>Team:</strong> ${teamName}`),
                    { label: "Set team password", url: data.resetUrl ?? "" },
                ),
            };
        }
        case "TEAM_REGISTRATION_REJECTED": {
            const title = `${rawTeamName || "Your team"} registration update`;
            return {
                type,
                subject: title,
                text: `Your team registration was not approved.${data.reason ? ` Reason: ${data.reason}` : ""}`,
                html: appLayout(title, paragraph("Your team registration was not approved.") + reason),
            };
        }
        case "TEAM_REGISTRATION_REOPENED": {
            const title = `${rawTeamName || "Your team"} registration reopened`;
            return {
                type,
                subject: title,
                text: `Your team registration has been reopened for changes.${data.reason ? ` Note: ${data.reason}` : ""}`,
                html: appLayout(
                    title,
                    paragraph("Your team registration has been reopened for changes.") +
                        (data.reason ? paragraph(`<strong>Note:</strong> ${escapeHtml(data.reason)}`) : ""),
                ),
            };
        }
        case "ACCOUNT_BANNED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 account has been restricted",
                text: `Your account has been restricted.${data.reason ? ` Reason: ${data.reason}` : ""}${data.expiresAt ? ` Until: ${data.expiresAt}` : ""}`,
                html: appLayout(
                    "Your account has been restricted",
                    paragraph("Your account has been restricted.") + reason + expires,
                ),
            };
        case "ACCOUNT_UNBANNED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 account has been restored",
                text: "Your KBU Hackathon 2026 account restriction has been removed.",
                html: appLayout(
                    "Your account has been restored",
                    paragraph("Your KBU Hackathon 2026 account restriction has been removed."),
                ),
            };
        case "ORGANIZER_ACCOUNT_CREATED":
            return {
                type,
                subject: "Your KBU Hackathon 2026 organizer account is ready",
                text: `Your organizer account has been created. Set your password using this link: ${data.resetUrl}`,
                html: appLayout(
                    "Your organizer account is ready",
                    paragraph("Your organizer account has been created. Use the button below to set your password."),
                    { label: "Set your password", url: data.resetUrl ?? "" },
                ),
            };
        case "LOGIN_SUCCESS": {
            const title = "Successful sign-in";
            const role = data.loginRole ?? "account";
            const loginAt = data.loginAt ?? new Date().toISOString();
            const formattedLoginAt = new Date(loginAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Bangkok",
            });
            const accountName = escapeHtml(data.teamName || data.loginEmail) || "your account";
            const text = `A successful sign-in occurred for ${data.teamName || data.loginEmail || "your account"}.\n\nAccount type: ${role}\nTime: ${formattedLoginAt} Thailand time\n\nIf you do not recognize this sign-in, contact the hackathon organizers immediately.`;
            const content =
                paragraph(`A successful sign-in occurred for <strong>${accountName}</strong>.`) +
                paragraph(
                    `<strong>Account type:</strong> ${escapeHtml(role)}<br /><strong>Time:</strong> ${escapeHtml(formattedLoginAt)} Thailand time`,
                ) +
                paragraph("If you do not recognize this sign-in, contact the hackathon organizers immediately.");
            return { type, subject: "Successful sign-in to KBU Hackathon 2026", text, html: appLayout(title, content) };
        }
    }
}

export function renderCustomEmailTemplate(subject: string, body: string): Omit<EmailMessage, "to"> {
    const htmlBody = escapeHtml(body).replace(/\r?\n/g, "<br />");
    return { subject, text: body, html: appLayout(subject, `<p>${htmlBody}</p>`) };
}
