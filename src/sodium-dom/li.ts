import { LazyGetter } from "lazy-get-decorator";
import { NaNode, NaElement, NaElementProps } from "./dom";
import { buildNode, setClassName } from "./utils";
import { NaDivElement } from "./div";

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
		setClassName(element, this.props);

		this.children.forEach((child) => element.appendChild(buildNode(child)));
		return element;
	}
}

export function li(props: NaLiElementProps, ...children: ReadonlyArray<NaNode>): NaLiElement;
export function li(...children: ReadonlyArray<NaNode>): NaLiElement;

export function li(
	arg0: NaLiElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaLiElement {
	if (!(arg0 instanceof NaElement || typeof arg0 === 'string')) {
		return new NaLiElement(arg0, children);
	} else {
		return new NaLiElement(undefined, [arg0, ...children]);
	}
}
