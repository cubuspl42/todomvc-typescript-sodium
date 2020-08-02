import { LazyGetter } from "lazy-get-decorator";
import { Stream, StreamSink, Unit } from "sodiumjs";
import { NaElement, NaElementProps } from "./dom";
import { setClassName } from "./utils";

interface NaButtonElementProps extends NaElementProps {
}

export class NaButtonElement extends NaElement {
	private readonly props?: NaButtonElementProps;

	constructor(props?: NaButtonElementProps) {
		super();
		this.props = props;
	}

	@LazyGetter()
	get htmlElement(): HTMLButtonElement {
		const element = document.createElement("button");
		setClassName(element, this.props);
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

export function button(props?: NaButtonElementProps): NaButtonElement {
	return new NaButtonElement(props);
}
