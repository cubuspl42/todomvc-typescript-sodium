import { LazyGetter } from "lazy-get-decorator";
import { Cell, Stream, StreamSink, Unit } from "sodiumjs";
import { NaElement, NaElementProps, NaNode } from "./dom";
import {
	buildElementWithChildrenC,
	linkChildrenC,
	linkClassName,
	NaElementChildren,
	vertexFromChildren
} from "./utils";
import { NaVertex } from "../sodium-collections/vertex";
import { NaArray } from "../sodium-collections/array";

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
		linkClassName(element, this.props);
		linkChildrenC(element, this.children);
		return element;
	}

	@LazyGetter()
	get sPressed(): Stream<Unit> {
		const element = this.htmlElement;

		const sink = new StreamSink<Unit>();

		// TODO: Unlisten (StreamSource?)
		element.addEventListener("click", (event) => {
			sink.send(Unit.UNIT);
		});

		return sink;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return vertexFromChildren(this.children);
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
