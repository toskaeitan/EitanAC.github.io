import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTocTree, visibleTocRows } from '../../src/utils/toc-tree.ts';
const h = (depth: number, slug: string) => ({ depth, slug, text: slug });
test('skipped heading levels attach to the nearest preceding ancestor', () => {
 const tree = buildTocTree([h(2,'a'),h(4,'a1'),h(3,'a2'),h(2,'b')], 3);
 assert.deepEqual(tree.map(n => [n.parent, n.level, n.hasChildren]), [[-1,0,true],[0,1,false],[0,1,false],[-1,0,false]]);
});
test('collapsing a branch hides all descendants but preserves sibling branches', () => {
 const tree = buildTocTree([h(2,'a'),h(3,'a1'),h(4,'a11'),h(2,'b'),h(3,'b1')],3);
 assert.deepEqual(visibleTocRows(tree, new Set([0])), [true,false,false,true,true]);
 assert.deepEqual(visibleTocRows(tree, new Set([1])), [true,true,false,true,true]);
});
test('depth filtering and empty headings remain safe', () => {
 assert.deepEqual(buildTocTree([],2), []);
 assert.deepEqual(buildTocTree([h(2,'a'),h(3,'b'),h(4,'c')],2).map(n=>n.slug), ['a','b']);
});
