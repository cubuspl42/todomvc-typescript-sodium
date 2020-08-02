import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren, linkChildren, linkClassName } from "./utils";
import { LazyGetter } from "lazy-get-decorator";

interface NaLinkElementProps extends NaElementProps {
	readonly href?: string;
}

export class NaLinkElement extends NaElement {
	private readonly props?: NaLinkElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(props: NaLinkElementProps | undefined, children: ReadonlyArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("a");
		linkClassName(element, this.props);
		linkChildren(element, this.children);

		const href = this.props?.href;
		if (href !== undefined) {
			element.href = href;
		}

		return element;
	}
}

export function link(props: NaLinkElementProps, ...children: ReadonlyArray<NaNode>): NaElement;
export function link(...children: ReadonlyArray<NaNode>): NaElement;

export function link(
	arg0: NaLinkElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaLinkElement(p, c),
	);
}
