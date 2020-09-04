import { LazyGetter } from "lazy-get-decorator";
import { NaElement } from "../dom";
import { NaNoopVertex, NaVertex } from "../../sodium-collections/vertex";

export class NaEmptyElement extends NaElement {
	@LazyGetter()
	get htmlElement(): HTMLElement {
		// FIXME: Don't create any element at all
		return document.createElement("div");
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return new NaNoopVertex();
	}
}

export function empty(): NaElement {
	return new NaEmptyElement();
}
