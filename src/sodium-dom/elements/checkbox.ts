import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps } from "../dom";
import { Cell, Stream, Transaction } from "sodiumjs";
import { linkProps, vertexFromProps } from "../utils";
import { NaVertex } from "../../sodium-collections/vertex";
import { eventSource } from "../eventSource";
import { Arrays } from "../../utils";

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
			sSetChecked.listen((c) => {
				this.htmlElement.checked = c;
			}, true);
		});

		this.cChecked = this.sChange.orElse(sSetChecked)
			.hold(props?.initialChecked ?? false);
	}

	@LazyGetter()
	get sChange(): Stream<boolean> {
		const element = this.htmlElement;
		return eventSource(element, "change").map((ev) => {
			const target = ev.target as HTMLInputElement;
			return target.checked;
		});
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
		linkProps(element, this.props);

		return element;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return NaVertex.from(Arrays.filterNotNull([
			vertexFromProps(this.props),
			this.sChange.vertex,
		]));
	}
}

export function checkbox(props?: NaCheckboxElementProps): NaCheckboxElement {
	return new NaCheckboxElement(props);
}
