import { NaElement, NaElementProps, NaNode } from "./dom";
import { CellOr, cellOrToCell, linkChildrenC, linkClassName } from "./utils";
import { Cell } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";

export class NaUlElement extends NaElement {
	private readonly props?: NaElementProps;

	private readonly children: Cell<ReadonlyArray<NaNode>>;

	constructor(
		props: NaElementProps | undefined,
		children: Cell<ReadonlyArray<NaNode>>,
	) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("ul");
		linkClassName(element, this.props);
		linkChildrenC(element, this.children);
		return element;
	}
}


export function ul(props: NaElementProps, children: ReadonlyArray<NaNode>): NaElement;
export function ul(children: ReadonlyArray<NaNode>): NaElement;

export function ul(props: NaElementProps, children: Cell<ReadonlyArray<NaNode>>): NaElement;
export function ul(children: Cell<ReadonlyArray<NaNode>>): NaElement;

export function ul(
	arg0: NaElementProps | CellOr<ReadonlyArray<NaNode>>,
	arg1?: CellOr<ReadonlyArray<NaNode>>,
): NaElement {
	if (arg0 instanceof Cell || arg0 instanceof Array) {
		return new NaUlElement(undefined, cellOrToCell(arg0));
	} else {
		return new NaUlElement(arg0 as NaElementProps, cellOrToCell(arg1!));
	}
}
