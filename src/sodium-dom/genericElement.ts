import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { linkChildrenC, linkClassName } from "./utils";
import { NaArray } from "../sodium-collections/array";

export class NaGenericElement extends NaElement {
	private readonly tagName: string;

	private readonly props?: NaElementProps;

	private readonly children: NaArray<NaNode>;

	constructor(
		tagName: string,
		props: NaElementProps | undefined,
		children: NaArray<NaNode>,
	) {
		super();
		this.tagName = tagName;
		this.props = props;
		this.children = children;
	}

	@LazyGetter()
	get htmlElement(): HTMLElement {
		const element = document.createElement(this.tagName);
		linkClassName(element, this.props);
		linkChildrenC(element, this.children);

		(element as any)._naElement = this;

		return element;
	}
}
