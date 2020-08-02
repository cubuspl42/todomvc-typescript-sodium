import { NaNode, NaElement, NaElementProps } from "./dom";

export function buildNode(element: NaNode): Node {
	return element instanceof NaElement ?
		element.htmlElement :
		document.createTextNode(element);
}

export function setClassName(htmlElement: HTMLElement, props: NaElementProps | undefined) {
	const className = props?.className;
	if (className !== undefined) {
		htmlElement.className = className;
	}
}
