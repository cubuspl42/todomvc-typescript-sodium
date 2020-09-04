import { NaElement, NaElementProps, NaNode } from "./dom";
import { Cell, Transaction, Vertex } from "sodiumjs";
import { NaGenericElement } from "./elements/genericElement";
import { NaArray } from "../sodium-collections/array";
import { NaNoopVertex, NaVertex } from "../sodium-collections/vertex";

export type CellOr<A> = Cell<A> | A;

export function cellOrToCell<A>(cellOr: CellOr<A>): Cell<A> {
	if (cellOr instanceof Cell) {
		return cellOr;
	} else {
		return new Cell(cellOr);
	}
}

export function buildNode(element: NaNode): Node {
	return element instanceof NaElement ?
		element.htmlElement :
		document.createTextNode(element);
}

export function buildElementWithChildren<TElementProps extends NaElementProps, TElement extends NaElement>(
	arg0: TElementProps | NaNode,
	children: ReadonlyArray<NaNode>,
	build: (props: TElementProps | undefined, children: ReadonlyArray<NaNode>) => TElement,
): TElement {
	if (!(arg0 instanceof NaElement || typeof arg0 === 'string')) {
		return build(arg0, children);
	} else {
		return build(undefined, [arg0, ...children]);
	}
}

export type NaElementChildren =
	ReadonlyArray<NaNode | Cell<NaNode>>
	| NaArray<NaNode>;

function normalizeNaElementChild(child: NaNode | Cell<NaNode>): Cell<NaNode> {
	return child instanceof Cell ?
		child :
		new Cell(child);
}

function normalizeNaElementChildren(children: NaElementChildren): NaArray<NaNode> {
	if (children instanceof NaArray) {
		return children;
	} else {
		const children_: ReadonlyArray<Cell<NaNode>> = children.map(normalizeNaElementChild);
		return NaArray.melt(children_);
	}
}

export function buildElementWithChildrenC<TElementProps extends NaElementProps, TElement extends NaElement>(
	arg0: NaElementProps | NaElementChildren,
	arg1: NaElementChildren | undefined,
	build: (props: TElementProps | undefined, children: NaArray<NaNode>) => TElement,
): TElement {
	if (arg0 instanceof NaArray || arg0 instanceof Array) {
		return build(undefined, normalizeNaElementChildren(arg0));
	} else {
		return build(arg0 as TElementProps, normalizeNaElementChildren(arg1 ?? []));
	}
}

export function buildGenericElementWithChildrenC(
	arg0: NaElementProps | NaElementChildren,
	arg1: NaElementChildren | undefined,
	tag: string,
): NaElement {
	return buildElementWithChildrenC(
		arg0,
		arg1,
		(p, c) => new NaGenericElement(tag, p, c),
	);
}

function clearChildren(element: HTMLElement) {
	while (element.firstChild) {
		element.removeChild(element.lastChild!);
	}
}

export function linkChildren(htmlElement: HTMLElement, children: ReadonlyArray<NaNode>) {
	children.forEach((child) => htmlElement.appendChild(buildNode(child)));
}

export function swapElements(node1: Node, node2: Node) {
	const marker = document.createElement("div");
	node1.parentNode?.insertBefore(marker, node1);
	node2.parentNode?.insertBefore(node1, node2);
	marker.parentNode?.insertBefore(node2, marker);
	marker.parentNode?.removeChild(marker);
}

export function linkChildrenC(htmlElement: HTMLElement, children: NaArray<NaNode>) {
	children.cContent.sample().forEach((element) => {
		const childNode = buildNode(element);
		htmlElement.appendChild(childNode);
	});

	Transaction.post(() => {
		children.sChange.listen((c) => {
			c.updates?.forEach((element, index) => {
				const oldNode = htmlElement.childNodes[index];
				const newNode = buildNode(element);
				htmlElement.replaceChild(newNode, oldNode);
			});

			c.swaps?.forEach((targetIndex, sourceIndex) => {
				const node1 = htmlElement.childNodes[sourceIndex];
				const node2 = htmlElement.childNodes[targetIndex];
				swapElements(node1, node2);
			});

			const deletes = c.deletes ?? new Set();
			const deletedNodes = [...deletes.values()].map(
				(index) => htmlElement.childNodes[index],
			);

			c.inserts?.forEach((elements, index) => {
				const newNodes = elements.map(buildNode);

				let node: Node = htmlElement.childNodes[index] ?? null;
				newNodes.reverse().forEach((newNode) => {
					node = htmlElement.insertBefore(newNode, node);
				})
			});

			deletedNodes.forEach((node) => {
				htmlElement.removeChild(node);
			});
		}, true);
	});
}

function linkClassName(htmlElement: HTMLElement, props: NaElementProps | undefined) {
	const className = props?.className;
	if (className !== undefined) {
		if (className instanceof Cell) {
			Transaction.post(() => {
				className.listen((c) => {
					htmlElement.className = c;
				}, true);
			});
		} else {
			htmlElement.className = className;
		}
	}
	return null;
}

function vertexOrNull<A>(cellOr: CellOr<A> | undefined) {
	if (cellOr instanceof Cell) {
		return cellOr.vertex;
	} else {
		return null;
	}
}

export function linkProps(htmlElement: HTMLElement, props: NaElementProps | undefined): void {
	linkClassName(htmlElement, props);
}

export function vertexFromProps(props: NaElementProps | undefined): Vertex | null {
	return vertexOrNull(props?.className);
}

export function vertexFromChildren(children: NaArray<NaNode>): Vertex {
	return NaVertex.from(
		children,
		(n) =>
			n instanceof NaElement ? n.vertex : new NaNoopVertex(),
	);
}
