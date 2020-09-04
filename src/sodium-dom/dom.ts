import { _Vertex, Stream, Transaction, Unit } from "sodiumjs";
import { CellOr } from "./utils";
import { LazyGetter } from "lazy-get-decorator";
import { Key } from 'ts-keycode-enum';
import { NaNoopVertex, NaVertex } from "../sodium-collections/vertex";
import { eventSource } from "./eventSource";

interface NaMouseEvent {
	readonly target: NaElement | null;
}

export abstract class NaElement {
	static from(htmlElement: HTMLElement | null): NaElement | null {
		const htmlElement_ = htmlElement as any;
		return htmlElement_?._naElement ?? null;
	}

	abstract get vertex(): NaVertex;

	abstract get htmlElement(): HTMLElement;

	@LazyGetter()
	get sKeyDown(): Stream<Key> {
		const element = this.htmlElement;
		return eventSource(element, "keydown").map((ev) => ev.keyCode as Key);
	}

	@LazyGetter()
	get sKeyUp(): Stream<Key> {
		const element = this.htmlElement;
		return eventSource(element, "keyup").map((ev) => ev.keyCode as Key);
	}

	@LazyGetter()
	get sDoubleClick(): Stream<Unit> {
		const element = this.htmlElement;
		return eventSource(element, "dblclick").map(() => Unit.UNIT);
	}

	@LazyGetter()
	get sClick(): Stream<NaMouseEvent> {
		const element = this.htmlElement;
		return eventSource(element, "click").map((ev) => ({
			target: NaElement.from(ev.target as HTMLElement),
		}));
	}

	contains(element: NaElement): boolean {
		return this.htmlElement.contains(element.htmlElement);
	}
}

export class NaBodyElement extends NaElement {
	@LazyGetter()
	get htmlElement(): HTMLElement {
		return document.body;
	}

	@LazyGetter()
	get vertex(): NaVertex {
		return new NaNoopVertex();
	}
}

export type NaNode = NaElement | string;

export interface NaElementProps {
	readonly id?: string,
	readonly className?: CellOr<string>;
}

export class NaDOM {
	@LazyGetter()
	static get body() {
		return new NaBodyElement();
	}

	static render(
		build: () => NaElement,
		container: HTMLElement,
	): void {
		Transaction.run(() => {
			const element = build();
			// TODO: Support "un-rendering"
			(element.vertex as _Vertex).incRefCount();
			container.prepend(element.htmlElement);
		});
	}
}
