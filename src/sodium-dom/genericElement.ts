import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "./dom";
import { linkChildren, linkClassName } from "./utils";

export class NaGenericElement extends NaElement {
	private readonly tagName: string;

	private readonly props?: NaElementProps;

	private readonly children: ReadonlyArray<NaNode>;

	constructor(
		tagName: string,
		props: NaElementProps | undefined,
		children: ReadonlyArray<NaNode>,
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
		linkChildren(element, this.children);
		return element;
	}
}
