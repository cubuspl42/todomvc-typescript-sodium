import { LazyGetter } from "lazy-get-decorator";
import { NaNode, NaElement, NaElementProps } from "./dom";
import { buildNode, linkClassName } from "./utils";
import { NaLabelElement } from "./label";

interface NaDivElementProps extends NaElementProps {
}

export class NaDivElement extends NaElement {
	private readonly props?: NaDivElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(props: NaDivElementProps | undefined, children: ReadonlyArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("div");
		linkClassName(element, this.props);

		this.children.forEach((child) => element.appendChild(buildNode(child)));
		return element;
	}
}

export function div(props: NaDivElementProps, ...children: ReadonlyArray<NaNode>): NaDivElement;
export function div(...children: ReadonlyArray<NaNode>): NaDivElement;

export function div(
	arg0: NaDivElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaDivElement {
	if (!(arg0 instanceof NaElement || typeof arg0 === 'string')) {
		return new NaDivElement(arg0, children);
	} else {
		return new NaDivElement(undefined, [arg0, ...children]);
	}
}
