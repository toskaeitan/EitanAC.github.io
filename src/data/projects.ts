/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "etf-lookthrough",
		title: "ETF Lookthrough",
		summary:
			"用来查看 Schwab 账户和 ETF 持仓的只读工具。把不同 ETF 中的同一家公司合并计算，看看组合主要持有哪些公司，以及持仓和收益的变化。",
		category: "finance",
		phase: "shipped",
		technologies: ["Python", "JavaScript", "SQLite"],
		icon: "material-symbols:deployed-code-outline-rounded",
		logo: "/assets/projects/etf-lookthrough.svg",
		featured: true,
		website: "https://etflookthrough.com/",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
