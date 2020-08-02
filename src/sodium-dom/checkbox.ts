import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps } from "./dom";
import { Cell, Stream, StreamSink } from "sodiumjs";
import { setClassName } from "./utils";

interface NaCheckboxElementProps extends NaElementProps {
	initialChecked?: boolean,
	sCheck?: Stream<boolean>,
}

export class NaCheckboxElement extends NaElement {
	private readonly props?: NaCheckboxElementProps;

	readonly cChecked: Cell<boolean>;

	private readonly sStateChanged = new StreamSink<boolean>();

	constructor(props: NaCheckboxElementProps | undefined) {
		super();
		this.props = props;

		const sCheck = props?.sCheck ?? new Stream<boolean>();
		this.cChecked = sCheck
			.orElse(this.sStateChanged)
			.hold(props?.initialChecked ?? false);
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("input");
		element.type = "checkbox";

		setClassName(element, this.props);

		// TODO: Unlisten
		element.addEventListener('change', (e) => {
			const target = e.target as HTMLInputElement;
			this.sStateChanged.send(target.checked);
		});

		return element;
	}
}

export function checkbox(props?: NaCheckboxElementProps): NaCheckboxElement {
	return new NaCheckboxElement(props);
}
