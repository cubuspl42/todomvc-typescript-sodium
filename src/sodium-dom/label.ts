import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildrenC, linkChildrenC, linkClassName, NaElementChildren } from "./utils";
import { Cell } from "sodiumjs";

interface NaLabelElementProps extends NaElementProps {
	readonly htmlFor?: string;
}

export class NaLabelElement extends NaElement {
	private readonly props?: NaLabelElementProps;

	private readonly children: Cell<ReadonlyArray<NaNode>>;

	constructor(props: NaLabelElementProps | undefined, children: Cell<ReadonlyArray<NaNode>>) {
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
		linkClassName(element, this.props);
		linkChildrenC(element, this.children);
		return element;
	}
}

export function label(props: NaLabelElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function label(children: ReadonlyArray<NaNode>): NaElement;

export function label(props: NaLabelElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function label(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function label(props: NaLabelElementProps, children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;
export function label(children: ReadonlyArray<NaNode | Cell<NaNode | null>>): NaElement;

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
