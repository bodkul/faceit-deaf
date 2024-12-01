import { supabase } from "@/lib/supabaseClient";

class Logger {
  private supabase = supabase;

  private async log(
    level: "info" | "warn" | "error",
    message: string,
    metadata?: object
  ) {
    await this.supabase.from("logs").insert({
      level,
      message,
      metadata,
    });
  }

  info(message: string, metadata?: object) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: object) {
    this.log("warn", message, metadata);
  }

  error(message: string, metadata?: object) {
    this.log("error", message, metadata);
  }
}

export const logger = new Logger();
