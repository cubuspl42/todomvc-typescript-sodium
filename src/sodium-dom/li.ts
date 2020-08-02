import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren, linkChildren, linkClassName } from "./utils";

interface NaLiElementProps extends NaElementProps {
}

export class NaLiElement extends NaElement {
	private readonly props?: NaLiElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(props: NaLiElementProps | undefined, children: ReadonlyArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("li");
		linkClassName(element, this.props);
		linkChildren(element, this.children);
		return element;
	}
}

export function li(props: NaLiElementProps, ...children: ReadonlyArray<NaNode>): NaLiElement;
export function li(...children: ReadonlyArray<NaNode>): NaLiElement;

export function li(
	arg0: NaLiElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaLiElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaLiElement(p, c),
	);
}
