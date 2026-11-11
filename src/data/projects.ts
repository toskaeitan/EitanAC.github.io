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
			"支持 Schwab 账户的只读组合分析。穿透 ETF 持仓并按公司归并，查看公司、行业和地区的底层敞口；提供期权风险分析、持仓热力图、组合表现和成交复盘。",
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
