import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "../dom";
import {
	buildElementWithChildrenC,
	linkChildrenC,
	linkProps,
	NaElementChildren,
	vertexFromChildren,
	vertexFromProps
} from "../utils";
import { Cell } from "sodiumjs";
import { NaArray } from "../../sodium-collections/array";
import { NaVertex } from "../../sodium-collections/vertex";
import { Arrays } from "../../utils";

interface NaLabelElementProps extends NaElementProps {
	readonly htmlFor?: string;
}

export class NaLabelElement extends NaElement {
	private readonly props?: NaLabelElementProps;

	private readonly children: NaArray<NaNode>;

	constructor(props: NaLabelElementProps | undefined, children: NaArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("label");
		const htmlFor = this.props?.htmlFor;
		if (htmlFor !== undefined) {
			element.htmlFor = htmlFor;
		}
		linkProps(element, this.props);
		linkChildrenC(element, this.children);
		return element;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return NaVertex.from(Arrays.filterNotNull([
			vertexFromProps(this.props),
			vertexFromChildren(this.children),
		]));
	}
}

export function label(props: NaLabelElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function label(children: ReadonlyArray<NaNode>): NaElement;

export function label(props: NaLabelElementProps, children: NaArray<NaNode>): NaElement;
export function label(children: NaArray<NaNode>): NaElement;

export function label(props: NaLabelElementProps, children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;
export function label(children: ReadonlyArray<NaNode | Cell<NaNode>>): NaElement;

export function label(
	arg0: NaLabelElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildElementWithChildrenC(
		arg0,
		arg1,
		(p, c) => new NaLabelElement(p, c),
	);
}
