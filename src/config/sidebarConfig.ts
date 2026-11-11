import type { SidebarConfig } from "@/types/sidebarConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

export const sidebarConfig: SidebarConfig = withUserConfig("sidebar", {
	enable: true,
	arrangement: "single",
	side: "left",
	components: [
		{ type: "profile", enable: true, slot: "top" },
		{ type: "announcement", enable: false, slot: "top", pages: ["home"] },
		{ type: "series", enable: true, slot: "sticky", collapseAfter: 5 },
		{ type: "categories", enable: true, slot: "sticky", collapseAfter: 5 },
		{ type: "tags", enable: true, slot: "sticky", collapseAfter: 8 },
		{ type: "toc", enable: true, slot: "sticky", pages: ["post"] },
	],
});
