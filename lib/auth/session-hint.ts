export const SESSION_HINT_COOKIE = "kbu_session_hint";

export function setSessionHint() {
    document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearSessionHint() {
    document.cookie = `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasSessionHint() {
    return document.cookie.split("; ").some((cookie) => cookie === `${SESSION_HINT_COOKIE}=1`);
}
