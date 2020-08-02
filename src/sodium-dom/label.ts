import { LazyGetter } from "lazy-get-decorator";
import { NaNode, NaElement, NaElementProps } from "./dom";
import { buildNode, linkClassName } from "./utils";

interface NaLabelElementProps extends NaElementProps {
}

export class NaLabelElement extends NaElement {
	private readonly props?: NaLabelElementProps;

	private readonly text: string;

	constructor(props: NaLabelElementProps | undefined, text: string) {
		super();
		this.props = props;
		this.text = text;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement("label");
		linkClassName(element, this.props);

		element.appendChild(document.createTextNode(this.text));
		return element;
	}
}

export function label(props: NaLabelElementProps, text: string): NaLabelElement;
export function label(text: string): NaLabelElement;

export function label(
	arg0: NaLabelElementProps | string,
	text?: string
): NaLabelElement {
	if (!(typeof arg0 == 'string')) {
		return new NaLabelElement(arg0, text!);
	} else {
		return new NaLabelElement(undefined, arg0);
	}
}
