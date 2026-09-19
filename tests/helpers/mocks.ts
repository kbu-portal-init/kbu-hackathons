import type { EmailMessage } from "@/lib/contracts/email";

export type MockedFunction<TArgs extends unknown[] = unknown[], TResult = unknown> = {
    (...args: TArgs): TResult;
    calls: TArgs[];
    reset(): void;
};
export function mockFunction<TArgs extends unknown[] = unknown[], TResult = unknown>(
    implementation?: (...args: TArgs) => TResult,
): MockedFunction<TArgs, TResult> {
    const calls: TArgs[] = [];
    const mock = ((...args: TArgs) => {
        calls.push(args);
        return implementation?.(...args) as TResult;
    }) as MockedFunction<TArgs, TResult>;
    mock.calls = calls;
    mock.reset = () => calls.splice(0, calls.length);
    return mock;
}
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export function createPrismaMock<T extends object>(overrides: DeepPartial<T> = {}): T {
    return overrides as T;
}
export type TestSession = {
    user: { id: string; role: string; email?: string; name?: string };
    session: { id: string; userId: string; expiresAt: Date };
};
export function createSession(overrides: Partial<TestSession> = {}): TestSession {
    return {
        user: { id: "user-test", role: "team", email: "test@example.test", name: "Test User" },
        session: { id: "session-test", userId: "user-test", expiresAt: new Date("2099-01-01T00:00:00.000Z") },
        ...overrides,
    };
}
export function createEmailSpy() {
    return mockFunction<[EmailMessage], Promise<{ accepted: string[] }>>(() =>
        Promise.resolve({ accepted: ["test@example.test"] }),
    );
}
export function createR2SendSpy() {
    return mockFunction<[unknown], Promise<Record<string, unknown>>>(() => Promise.resolve({}));
}
