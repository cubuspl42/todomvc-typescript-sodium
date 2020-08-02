import { LazyGetter } from "lazy-get-decorator";
import { NaNode, NaElement, NaElementProps } from "./dom";
import { buildElementWithChildren, buildNode, linkChildren, linkClassName } from "./utils";

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
		linkChildren(element, this.children);
		return element;
	}
}

export function div(props: NaDivElementProps, ...children: ReadonlyArray<NaNode>): NaDivElement;
export function div(...children: ReadonlyArray<NaNode>): NaDivElement;

export function div(
	arg0: NaDivElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaDivElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaDivElement(p, c),
	);
}
