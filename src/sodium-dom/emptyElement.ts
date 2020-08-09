import { LazyGetter } from "lazy-get-decorator";
import { NaElement } from "./dom";

export class NaEmptyElement extends NaElement {
	@LazyGetter()
	get htmlElement(): HTMLElement {
		// FIXME: Don't create any element at all
		return document.createElement("div");
	}
}

export function empty(): NaElement {
	return new NaEmptyElement();
}
