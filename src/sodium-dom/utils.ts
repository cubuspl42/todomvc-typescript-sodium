import { NaElement, NaElementProps, NaNode } from "./dom";
import { Cell } from "sodiumjs";
import { NaGenericElement } from "./genericElement";
import { NaEmptyElement } from "./emptyElement";

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
	ReadonlyArray<NaNode | Cell<NaNode | null>>
	| Cell<ReadonlyArray<NaNode>>;

function filterNotNull<A>(array: ReadonlyArray<A>): ReadonlyArray<NonNullable<A>> {
	return array.filter((a) => a !== null) as unknown as ReadonlyArray<NonNullable<A>>;
}

function normalizeNaElementChildren(children: NaElementChildren): Cell<ReadonlyArray<NaNode>> {
	if (children instanceof Cell) {
		return children;
	} else {
		const children_: ReadonlyArray<Cell<NaNode | null>> =
			children.map((c) => c instanceof Cell ? c : new Cell(c));
		return Cell.liftArray(children_).map((c) => filterNotNull(c));
	}
}

export function buildElementWithChildrenC<TElementProps extends NaElementProps, TElement extends NaElement>(
	arg0: NaElementProps | NaElementChildren,
	arg1: NaElementChildren | undefined,
	build: (props: TElementProps | undefined, children: Cell<ReadonlyArray<NaNode>>) => TElement,
): TElement {
	if (arg0 instanceof Cell || arg0 instanceof Array) {
		return build(undefined, cellOrToCell(arg0));
	} else {
		return build(arg0 as TElementProps, normalizeNaElementChildren(arg1!));
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

export function linkChildrenC(htmlElement: HTMLElement, children: Cell<ReadonlyArray<NaNode>>) {
	// TODO: Unlisten
	children?.listen((c) => {
		clearChildren(htmlElement);
		c.forEach((child) => {
			if (!(child instanceof NaEmptyElement)) {
				htmlElement.appendChild(buildNode(child));
			}
		});
	});
}

export function linkClassName(htmlElement: HTMLElement, props: NaElementProps | undefined) {
	const className = props?.className;
	if (className !== undefined) {
		if (className instanceof Cell) {
			// TODO: Unlisten
			className?.listen((c) => {
				htmlElement.className = c;
			});
		} else {
			htmlElement.className = className;
		}
	}
}
