import { LazyGetter } from "lazy-get-decorator";
import { Stream, StreamSink, Unit } from "sodiumjs";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { buildElementWithChildren, linkChildren, linkClassName } from "./utils";
import { NaGenericElement } from "./genericElement";

interface NaButtonElementProps extends NaElementProps {
}

export class NaButtonElement extends NaElement {
	private readonly props?: NaButtonElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(props: NaButtonElementProps | undefined, children: ReadonlyArray<NaNode>) {
		super();
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLButtonElement {
		const element = document.createElement("button");
		linkClassName(element, this.props);
		linkChildren(element, this.children);
		return element;
	}

	@LazyGetter()
	get sPressed(): Stream<Unit> {
		const element = this.htmlElement;

		const sink = new StreamSink<Unit>();

		// TODO: Unlisten
		element.addEventListener("click", (event) => {
			sink.send(Unit.UNIT);
		});

		return sink;
	}
}

export function button(props: NaButtonElementProps, ...children: ReadonlyArray<NaNode>): NaButtonElement;
export function button(...children: ReadonlyArray<NaNode>): NaButtonElement;

export function button(
	arg0: NaButtonElementProps | NaNode,
	...children: ReadonlyArray<NaNode>
): NaButtonElement {
	return buildElementWithChildren(
		arg0,
		children,
		(p, c) => new NaButtonElement(p, c),
	);
}
