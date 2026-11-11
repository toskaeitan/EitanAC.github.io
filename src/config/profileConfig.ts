import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/eitan-avatar.jpg",
	name: "Eitan",
	bio: "Nothing ventured, nothing gained.",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/toskaeitan",
		},
	],
});
