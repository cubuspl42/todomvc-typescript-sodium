import { NaElement, NaElementProps } from "./dom";
import { Cell, Stream, StreamSink } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";
import { linkClassName } from "./utils";

interface NaTextInputElementProps extends NaElementProps {
	readonly initialText?: string;
	readonly sSubstituteText?: Stream<string>;
	readonly placeholder?: string;
	readonly autofocus?: boolean;
}

export class NaTextInputElement extends NaElement {
	private readonly props?: NaTextInputElementProps;

	constructor(props: NaTextInputElementProps | undefined) {
		super();
		this.props = props;
	}

	@LazyGetter()
	get htmlElement(): HTMLInputElement {
		const element = document.createElement("input");
		linkClassName(element, this.props);

		const placeholder = this.props?.placeholder;
		if (placeholder !== undefined) {
			element.placeholder = placeholder;
		}

		// TODO: Unlisten
		this.props?.sSubstituteText?.listen((text) => {
			element.value = "";
		});

		return element;
	}

	@LazyGetter()
	get sInputChanged(): Stream<string> {
		const element = this.htmlElement;

		const sink = new StreamSink<string>();

		// TODO: Unlisten
		element.addEventListener("input", (event) => {
			sink.send(element.value);
		});

		return sink;
	}

	@LazyGetter()
	get cText(): Cell<string> {
		const sSubstituteText = this.props?.sSubstituteText ?? new Stream<string>();
		return sSubstituteText
			.orElse(this.sInputChanged)
			.hold(this.props?.initialText ?? "");
	}
}

export function textInput(props?: NaTextInputElementProps): NaTextInputElement {
	return new NaTextInputElement(props);
}
