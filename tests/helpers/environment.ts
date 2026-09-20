type Environment = Record<string, string | undefined>;

export async function withEnvironment<T>(values: Environment, callback: () => T | Promise<T>): Promise<T> {
    const original = new Map<string, string | undefined>();
    for (const [name, value] of Object.entries(values)) {
        original.set(name, process.env[name]);
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
    }
    try {
        return await callback();
    } finally {
        for (const [name, value] of original) {
            if (value === undefined) delete process.env[name];
            else process.env[name] = value;
        }
    }
}

export function createTestEnvironment(overrides: Environment = {}): Environment {
    return { NODE_ENV: "test", ...overrides };
}
