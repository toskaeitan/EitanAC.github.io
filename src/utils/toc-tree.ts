export interface TocHeading {
	depth: number;
	text: string;
	slug: string;
}
export interface TocNode extends TocHeading {
	parent: number;
	level: number;
	hasChildren: boolean;
}

/** Keep source order; skipped Markdown levels still form a connected tree. */
export function buildTocTree(headings: TocHeading[], maxDepth = 3): TocNode[] {
	const base = Math.min(...headings.map((h) => h.depth));
	const nodes: TocNode[] = [];
	const stack: number[] = [];
	for (const heading of headings.filter((h) => h.depth < base + maxDepth)) {
		while (stack.length && nodes[stack.at(-1)!]!.depth >= heading.depth)
			stack.pop();
		const parent = stack.at(-1) ?? -1;
		if (parent >= 0) nodes[parent]!.hasChildren = true;
		nodes.push({ ...heading, parent, level: stack.length, hasChildren: false });
		stack.push(nodes.length - 1);
	}
	return nodes;
}

export function visibleTocRows(
	nodes: Pick<TocNode, "parent">[],
	collapsed: Set<number>,
): boolean[] {
	const visible: boolean[] = [];
	nodes.forEach((node, index) => {
		visible[index] =
			node.parent < 0 ||
			(visible[node.parent] === true && !collapsed.has(node.parent));
	});
	return visible;
}
