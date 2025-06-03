"use server";

import { signIn, signOut } from "@/lib/auth";

export const login = async () => {
  await signIn("faceit");
};

export const logout = async () => {
  await signOut();
};
