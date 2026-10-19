# File storage workflow

Uploads use `app/api/upload/proxy` and `app/api/upload/delete`. The browser sends the file as `multipart/form-data` to the proxy route, which validates the session, file type, and size, then streams the object to R2.

## Ownership and key prefixes

- Team categories (`image`, `submission`, `member-profile-image`) require an approved team session and use `uploads/<team-id>/`.
- `event-image` requires an organizer/admin session and uses `uploads/events/`.
- `announcement-image` requires an organizer/admin session and uses `uploads/announcements/`.
- `admin-profile-image` requires an admin session and uses `uploads/admins/<admin-id>/`.

## Image encoding

Image uploads are resized to at most 1600px and re-encoded server-side. Announcement images are encoded as JPEG because they are used as social previews (`og:image`), which Facebook only accepts as JPEG/PNG/GIF; all other image categories are encoded as WebP. Animated GIFs are rejected.

## Security rules

- Services must enforce key ownership and never trust a client-provided URL or key outside the authorized prefix.
- Event image URLs are saved separately through event settings; storage deletion does not update database URL arrays.

## Environment variables

Cloudflare R2 requires `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `NEXT_PUBLIC_R2_PUBLIC_URL`.
