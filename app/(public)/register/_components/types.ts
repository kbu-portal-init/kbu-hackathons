import type { z } from "zod";
import type { EducationProgram, submitRegistrationSchema } from "@/lib/contracts/registration";

export type Locale = "en" | "th";
export type FormValues = z.input<typeof submitRegistrationSchema>;
export type SubmittedFormValues = z.output<typeof submitRegistrationSchema>;
export type ProgramSlot = { program: EducationProgram; remaining: number; limit: number };
