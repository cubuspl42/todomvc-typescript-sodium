import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps } from "./dom";
import { Cell, Stream, StreamSink, Transaction } from "sodiumjs";
import { linkClassName } from "./utils";
import { NaNoopVertex, NaVertex } from "../sodium-collections/vertex";

interface NaCheckboxElementProps extends NaElementProps {
	readonly initialChecked?: boolean,
	readonly sSetChecked?: Stream<boolean>,
}

export class NaCheckboxElement extends NaElement {
	private readonly props?: NaCheckboxElementProps;

	readonly cChecked: Cell<boolean>;

	constructor(props: NaCheckboxElementProps | undefined) {
		super();
		this.props = props;

		const sSetChecked = props?.sSetChecked ?? new Stream<boolean>();

		Transaction.post(() => {
			// TODO: Unlisten
			sSetChecked.listen((c) => {
				this.htmlElement.checked = c;
			});
		});

		this.cChecked = this.sChange.orElse(sSetChecked)
			.hold(props?.initialChecked ?? false);
	}

	@LazyGetter()
	get sChange(): Stream<boolean> {
		const element = this.htmlElement;
		const sink = new StreamSink<boolean>();

		// TODO: Unlisten
		element.addEventListener("change", (e) => {
			const target = e.target as HTMLInputElement;
			sink.send(target.checked);
		});

		return sink;
	}

	@LazyGetter()
	get htmlElement(): HTMLInputElement {
		const element = document.createElement("input");
		element.type = "checkbox";
		element.checked = this.props?.initialChecked ?? false;

		const id = this.props?.id;
		if (id !== undefined) {
			element.id = id;
		}
		linkClassName(element, this.props);

		return element;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return new NaNoopVertex();
	}
}

export function checkbox(props?: NaCheckboxElementProps): NaCheckboxElement {
	return new NaCheckboxElement(props);
}
