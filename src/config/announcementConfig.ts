import type { AnnouncementConfig } from "@/types/announcementConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

export const announcementConfig: AnnouncementConfig = withUserConfig(
	"announcement",
	{
		title: "公告",
		content: "",
		closable: true,
		link: { enable: false, text: "", url: "", external: false },
	},
);
