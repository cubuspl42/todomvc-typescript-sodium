import { LazyGetter } from "lazy-get-decorator";
import { NaElement } from "./dom";

export class NaEmptyElement extends NaElement {
	@LazyGetter()
	get htmlElement(): HTMLElement {
		throw new Error("Unimplemented");
	}
}

export function empty(): NaElement {
	return new NaEmptyElement();
}
