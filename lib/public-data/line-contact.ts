import "server-only";

export type LineContact = {
    url: string;
    name: string;
};

export function getLineContact(): LineContact {
    return {
        url: process.env.LINE_CONTACT_URL ?? "",
        name: process.env.LINE_CONTACT_NAME ?? "",
    };
}
