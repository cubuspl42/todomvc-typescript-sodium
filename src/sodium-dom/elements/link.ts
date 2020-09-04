import { NaElement, NaElementProps, NaNode } from "../dom";
import {
	buildElementWithChildrenC,
	linkChildrenC,
	linkClassName,
	NaElementChildren,
	vertexFromChildren
} from "../utils";
import { LazyGetter } from "lazy-get-decorator";
import { NaVertex } from "../../sodium-collections/vertex";
import { NaArray } from "../../sodium-collections/array";
import { Cell, Stream, StreamSink, Unit } from "sodiumjs";

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
	get sFollowed(): Stream<Unit> {
		const element = this.htmlElement;

		const sink = new StreamSink<Unit>();

		// TODO: Unlisten
		element.addEventListener("click", (event) => {
			event.preventDefault();
			sink.send(Unit.UNIT);
		});

		return sink;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return vertexFromChildren(this.children);
	}
}

export function link(props: NaLinkElementProps, children: ReadonlyArray<NaNode>): NaLinkElement;
export function link(children: ReadonlyArray<NaNode>): NaLinkElement;

export function link(props: NaLinkElementProps, children: NaArray<NaNode>): NaLinkElement;
export function link(children: NaArray<NaNode>): NaLinkElement;

export function link(props: NaLinkElementProps, children: ReadonlyArray<NaNode | Cell<NaNode>>): NaLinkElement;
export function link(children: ReadonlyArray<NaNode | Cell<NaNode>>): NaLinkElement;

export function link(
	arg0: NaLinkElementProps | NaElementChildren,
	arg1?: NaElementChildren,
): NaLinkElement {
	return buildElementWithChildrenC(
		arg0,
		arg1,
		(p, c) => new NaLinkElement(p, c),
	);
}
