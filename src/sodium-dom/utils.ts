import { NaElement, NaElementProps, NaNode } from "./dom";
import { Cell } from "sodiumjs";

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
		c.forEach((child) => htmlElement.appendChild(buildNode(child)));
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
