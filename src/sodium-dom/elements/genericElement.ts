import { LazyGetter } from "lazy-get-decorator";
import { NaElement, NaElementProps, NaNode } from "../dom";
import { changesFromChildren, linkChildrenC, linkProps, vertexFromPropsAndChildren } from "../utils";
import { NaArray } from "../../sodium-collections/array";
import { NaVertex } from "../../sodium-collections/vertex";
import { Stream, Unit } from "sodiumjs";

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
		linkProps(element, this.props);
		linkChildrenC(element, this.children);

		(element as any)._naElement = this;

		return element;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return vertexFromPropsAndChildren(this.props, this.children);
	}

	@LazyGetter()
	get sChanged(): Stream<Unit> {
		return changesFromChildren(this, this.children);
	}
}
