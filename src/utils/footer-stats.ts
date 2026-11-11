import { execFileSync } from "node:child_process";

const DAY_MS = 86_400_000;
let sourceCommitDate: string | undefined;

/** Read HEAD even in a shallow checkout; exported/static copies use launch day. */
export function getSourceCommitDate(fallback: string): string {
	if (sourceCommitDate !== undefined) return sourceCommitDate;
	try {
		const value = execFileSync("git", ["log", "-1", "--format=%cI"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
			timeout: 2000,
		}).trim();
		sourceCommitDate = Number.isFinite(Date.parse(value)) ? value : fallback;
	} catch {
		sourceCommitDate = fallback;
	}
	return sourceCommitDate;
}

export function resolveFooterDates(
	launchedAt: string,
	commitDate: string,
	activityDates: (Date | string | null | undefined)[],
	now = Date.now(),
): { days: number; updatedAt: string } {
	const launched = Date.parse(launchedAt);
	const dates = [launchedAt, commitDate, ...activityDates]
		.filter((date): date is Date | string => date != null)
		.map((date) => new Date(date).getTime())
		.filter(Number.isFinite);
	return {
		days: Math.max(0, Math.floor((now - launched) / DAY_MS)),
		updatedAt: new Date(Math.max(...dates)).toISOString(),
	};
}
