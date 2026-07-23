import { mkdir, readFile, writeFile } from "node:fs/promises";

interface History {
  dates: Record<string, { sentAt: string; status: "sent" }>;
}

const HISTORY_PATH = new URL("../data/run-history.json", import.meta.url);

export async function wasSent(date: string): Promise<boolean> {
  const history = await readHistory();
  return history.dates[date]?.status === "sent";
}

export async function recordRun(date: string, status: "sent"): Promise<void> {
  const history = await readHistory();
  history.dates[date] = { sentAt: new Date().toISOString(), status };
  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, "utf8");
}

async function readHistory(): Promise<History> {
  try {
    return JSON.parse(await readFile(HISTORY_PATH, "utf8")) as History;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { dates: {} };
    throw error;
  }
}
