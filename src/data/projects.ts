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
			"连接 Schwab 的只读组合分析工具。穿透 ETF 并合并重复持仓，查看公司、行业和地区敞口，检查集中度与持仓期权风险，跟踪收益和成交。",
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
