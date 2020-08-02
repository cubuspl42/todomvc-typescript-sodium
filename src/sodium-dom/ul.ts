import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren, linkChildren, linkClassName } from "./utils";

interface NaUlElementProps extends NaElementProps {
}

export class NaUlElement extends NaElement {
	private readonly props?: NaUlElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(props: NaUlElementProps | undefined, children: ReadonlyArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("ul");
		linkClassName(element, this.props);
		linkChildren(element, this.children);
		return element;
	}
}

export function ul(props: NaUlElementProps, ...children: ReadonlyArray<NaNode>): NaUlElement;
export function ul(...children: ReadonlyArray<NaNode>): NaUlElement;

export function ul(
	arg0: NaUlElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaUlElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaUlElement(p, c),
	);
}
