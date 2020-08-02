import { NaNode, NaElement, NaElementProps } from "./dom";
import { Cell } from "sodiumjs";

export type CellOr<A> = Cell<A> | A;

export function buildNode(element: NaNode): Node {
	return element instanceof NaElement ?
		element.htmlElement :
		document.createTextNode(element);
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
