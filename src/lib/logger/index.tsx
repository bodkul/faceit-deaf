import { supabase } from "@/lib/supabaseClient";

type Level = "info" | "warn" | "error";
type Message = string | object | number;

class Logger {
  private supabase = supabase;

  private async log(level: Level, message: Message) {
    globalThis.console[level]?.(message);

    await this.supabase.from("logs").insert({
      level,
      message,
    });

    console.log();
  }

  info(message: Message) {
    this.log("info", message);
  }

  warn(message: Message) {
    this.log("warn", message);
  }

  error(message: Message) {
    this.log("error", message);
  }
}

export const logger = new Logger();
