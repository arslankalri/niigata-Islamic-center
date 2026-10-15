import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "arslankalri@gmail.com";

// One-time admin account creation. Public sign-up stays disabled in auth settings;
// this only works for the administrator email and only while that account doesn't exist.
export const createAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => {
    const email = String(d?.email ?? "").trim().toLowerCase();
    const password = String(d?.password ?? "");
    if (email !== ADMIN_EMAIL) throw new Error("This email is not allowed to sign up.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    return { email, password };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) {
      if (/already/i.test(error.message)) throw new Error("Account already exists. Please sign in.");
      throw new Error("Could not create the account.");
    }
    return { ok: true };
  });
