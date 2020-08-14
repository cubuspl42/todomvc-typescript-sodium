import { NaElement, NaElementProps, NaNode } from "./dom";
import {
	buildElementWithChildrenC,
	linkChildrenC,
	linkClassName,
	NaElementChildren,
	vertexFromChildren
} from "./utils";
import { LazyGetter } from "lazy-get-decorator";
import { NaVertex } from "../sodium-collections/vertex";
import { NaArray } from "../sodium-collections/array";
import { Cell } from "sodiumjs";

interface NaLinkElementProps extends NaElementProps {
	readonly href?: string;
}

export class NaLinkElement extends NaElement {
	private readonly props?: NaLinkElementProps;

	private readonly children: NaArray<NaNode>;

	constructor(props: NaLinkElementProps | undefined, children: NaArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("a");
		linkClassName(element, this.props);
		linkChildrenC(element, this.children);

		const href = this.props?.href;
		if (href !== undefined) {
			element.href = href;
		}

		return element;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return vertexFromChildren(this.children);
	}
}

export function link(props: NaLinkElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function link(children: ReadonlyArray<NaNode>): NaElement;

export function link(props: NaLinkElementProps, children: NaArray<NaNode>): NaElement;
export function link(children: NaArray<NaNode>): NaElement;

export function link(props: NaLinkElementProps, children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;
export function link(children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;

export function link(
	arg0: NaLinkElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildElementWithChildrenC(
		arg0,
		arg1,
		(p, c) => new NaLinkElement(p, c),
	);
}
