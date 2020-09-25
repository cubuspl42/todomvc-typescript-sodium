import { LazyGetter } from "lazy-get-decorator";
import { Cell, Stream, Unit, Vertex } from "sodiumjs";
import { NaElement, NaElementProps, NaNode } from "../dom";
import {
	buildElementWithChildrenC,
	changesFromChildren,
	linkChildrenC,
	linkProps,
	NaElementChildren,
	vertexFromPropsAndChildren
} from "../utils";
import { NaArray } from "../../sodium-collections/array";
import { eventSource } from "../eventSource";

interface NaButtonElementProps extends NaElementProps {
}

export class NaButtonElement extends NaElement {
	private readonly props?: NaButtonElementProps;

	private readonly children: NaArray<NaNode>;

	constructor(props: NaButtonElementProps | undefined, children: NaArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLButtonElement {
		const element = document.createElement("button");
		linkProps(element, this.props);
		linkChildrenC(element, this.children);
		return element;
	}

	@LazyGetter()
	get sPressed(): Stream<Unit> {
		const element = this.htmlElement;
		return eventSource(element, "click").map(() => Unit.UNIT);
	}

	@LazyGetter()
	get vertex(): Vertex {
		return vertexFromPropsAndChildren(this.props, this.children);
	}

	@LazyGetter()
	get sChanged(): Stream<Unit> {
		return changesFromChildren(this, this.children);
	}
}

export function button(props: NaButtonElementProps, children?: ReadonlyArray<NaNode>): NaButtonElement;
export function button(children: ReadonlyArray<NaNode>): NaButtonElement;

export function button(props: NaButtonElementProps, children: NaArray<NaNode>): NaButtonElement;
export function button(children: NaArray<NaNode>): NaButtonElement;

export function button(props: NaButtonElementProps, children: ReadonlyArray<NaNode | Cell<NaNode>>): NaButtonElement;
export function button(children: ReadonlyArray<NaNode | Cell<NaNode>>): NaButtonElement;

export function button(
	arg0: NaButtonElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaElement {
	return buildElementWithChildrenC(
		arg0,
		arg1,
		(p, c) => new NaButtonElement(p, c),
	);
}
