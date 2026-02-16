import { z } from "zod";

// Password must be at least 8 characters, 1 uppercase letter, 1 number
const passwordSchema = z
  .string()
  .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
  .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
  .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail-Adresse ist erforderlich")
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name muss mindestens 2 Zeichen lang sein")
      .max(100, "Name darf maximal 100 Zeichen lang sein"),
    organizationName: z
      .string()
      .min(2, "Organisationsname muss mindestens 2 Zeichen lang sein")
      .max(100, "Organisationsname darf maximal 100 Zeichen lang sein"),
    email: z
      .string()
      .min(1, "E-Mail-Adresse ist erforderlich")
      .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail-Adresse ist erforderlich")
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
