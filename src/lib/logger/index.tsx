import { supabase } from "@/lib/supabase/client";

class Logger {
  private supabase = supabase;

  private async log(
    level: "info" | "warn" | "error",
    message: string,
    metadata?: any,
  ) {
    await this.supabase.from("logs").insert({
      level,
      message,
      metadata,
    });
  }

  info(message: string, metadata?: any) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: any) {
    this.log("warn", message, metadata);
  }

  error(message: string, metadata?: any) {
    this.log("error", message, metadata);
  }
}

export const logger = new Logger();
