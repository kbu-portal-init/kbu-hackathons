import { NextResponse } from "next/server";
import type { ActionResult } from "@/lib/contracts/common";

export function getActionResultStatus(code: string): number {
    switch (code) {
        case "VALIDATION_ERROR":
        case "INVALID_JSON":
            return 400;

        case "UNAUTHORIZED":
            return 401;

        case "FORBIDDEN":
            return 403;

        case "ANNOUNCEMENT_NOT_FOUND":
            return 404;

        case "ANNOUNCEMENT_INVALID_TRANSITION":
            return 409;

        default:
            return 500;
    }
}

export function actionResultResponse<T>(result: ActionResult<T>, successStatus = 200) {
    if (!result.ok) {
        return NextResponse.json(result, {
            status: getActionResultStatus(result.error.code),
        });
    }

    return NextResponse.json(result, {
        status: successStatus,
    });
}
