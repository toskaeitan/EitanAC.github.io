/**
 * 友情链接数据配置（结构与 Mizuki 同款，便于互相迁移）。
 * 用于管理友情链接页面的数据：src/pages/friends.astro → organisms/FriendSection。
 *
 * 添加友链：在 friendsData 中追加一项即可，页面 / 筛选标签自动生成。
 * tags 会聚合为页面顶部的筛选 chip（OR 命中：选中多个标签时命中任一即显示）。
 */
export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "黎明の小站",
		// Avatar and description supplied by the site owner.
		imgurl: "https://q.qlogo.cn/headimg_dl?dst_uin=3255235912&spec=640&img_type=jpg",
		desc: "关注黎明喵~关注黎明谢谢喵~",
		siteurl: "https://blog.yoake.dev/",
		tags: [],
	},
	{
		id: 2,
		title: "松坂日记",
		// Image source: https://blog.mysqil.com/images/favicon/favicon-192.png
		imgurl: "/assets/friends/mysqil.webp",
		desc: "一个基于内容分享,创作与灵感结合折腾的笔记博客",
		siteurl: "https://blog.mysqil.com/",
		tags: [],
	},
	{
		id: 3,
		title: "年华",
		// Image source: https://blog.amamo.top/favicon/favicon2.png
		imgurl: "/assets/friends/amamo.webp",
		desc: "基于Firefly和Astro开发的个人博客，我会在这里分享生活和技术。",
		siteurl: "https://blog.amamo.top/",
		tags: [],
	},
	{
		id: 4,
		title: "梦春酱的温馨小屋",
		// Image source: https://new.yumeharu.top/assets/images/favicon-32x32.png
		imgurl: "/assets/friends/yumeharu.webp",
		desc: "Not for the best, just for the better.",
		siteurl: "https://new.yumeharu.top/",
		tags: [],
	},
	{
		id: 5,
		title: "SuzuhaYuki's Blog",
		// Image source: https://blog.yuk1.uk/_astro/avatar.D77mm3NB_dKL2U.webp
		imgurl: "/assets/friends/yuki.webp",
		desc: "Time goes by, and the years go by.",
		siteurl: "https://blog.yuk1.uk/",
		tags: [],
	},
];

// 获取所有友情链接数据（稳定顺序，测试可复现）
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据（避免固定排序，按需使用）
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
