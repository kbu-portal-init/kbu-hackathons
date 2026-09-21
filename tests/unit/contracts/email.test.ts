import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studentEmailSchema } from "@/lib/contracts/email";

describe("student email contract", () => {
    it("accepts exactly twelve digits after lowercase u", () => {
        assert.equal(studentEmailSchema.safeParse("u661305001234@ms.kbu.ac.th").success, true);
    });

    it("rejects other local-part formats and digit counts", () => {
        for (const email of [
            "66130500123@ms.kbu.ac.th",
            "u12345678901@ms.kbu.ac.th",
            "u1234567890123@ms.kbu.ac.th",
            "u123456789012@gmail.com",
        ]) {
            assert.equal(studentEmailSchema.safeParse(email).success, false, email);
        }
    });
});
