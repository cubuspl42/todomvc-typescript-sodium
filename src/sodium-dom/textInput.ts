import { NaElement, NaElementProps } from "./dom";
import { Cell, Stream, StreamSink, Transaction, Unit } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";
import { linkClassName } from "./utils";
import { NaNoopVertex, NaVertex } from "../sodium-collections/vertex";

interface NaTextInputElementProps extends NaElementProps {
	readonly initialText?: string;
	readonly sSubstituteText?: Stream<string>;
	readonly sFocus?: Stream<Unit>;
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

		Transaction.post(() => {
			// TODO: Unlisten
			this.props?.sSubstituteText?.listen((text) => {
				element.value = text;
			});
		});

		const sFocus = this.props?.sFocus;
		if (sFocus !== undefined) {
			// Operational.defer(sFocus).listen(() => {
			// 	element.focus();
			// });
			sFocus.listen(() => {
				setTimeout(() => {
					element.focus();
				}, 0);
			});
		}

		(element as any)._naElement = this;

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

	@LazyGetter()
	get vertex(): NaVertex {
		return new NaNoopVertex();
	}
}

export function textInput(props?: NaTextInputElementProps): NaTextInputElement {
	return new NaTextInputElement(props);
}
