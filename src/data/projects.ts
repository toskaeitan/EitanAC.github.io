/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "etf-lookthrough",
		title: "ETF Lookthrough",
		summary: "面向 Schwab 账户的只读投资组合分析工具。穿透 ETF 底层持仓、归并重复公司敞口，结合集中度、组合表现与 ETF 持仓变动，帮助复核实际暴露。",
		category: "finance",
		phase: "shipped",
		technologies: ["Python", "JavaScript", "SQLite"],
		icon: "material-symbols:deployed-code-outline-rounded",
		featured: true,
		website: "https://etflookthrough.com/",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
