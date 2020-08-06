import { Stream, StreamSink, Transaction, Unit } from "sodiumjs";
import { CellOr } from "./utils";
import { LazyGetter } from "lazy-get-decorator";
import { Key } from 'ts-keycode-enum';

interface NaMouseEvent {
	readonly target: NaElement | null;
}

export abstract class NaElement {
	static from(htmlElement: HTMLElement | null): NaElement | null {
		const htmlElement_ = htmlElement as any;
		return htmlElement_?._naElement ?? null;
	}

	abstract get htmlElement(): HTMLElement;

	@LazyGetter()
	get sKeyDown(): Stream<Key> {
		const element = this.htmlElement;
		const sink = new StreamSink<Key>();

		// TODO: Unlisten
		element.addEventListener("keydown", (event) => {
			sink.send(event.keyCode as Key);
		});

		return sink;
	}

	@LazyGetter()
	get sKeyUp(): Stream<Key> {
		const element = this.htmlElement;
		const sink = new StreamSink<Key>();

		// TODO: Unlisten
		element.addEventListener("keyup", (event) => {
			sink.send(event.keyCode as Key);
		});

		return sink;
	}

	@LazyGetter()
	get sDoubleClick(): Stream<Unit> {
		const element = this.htmlElement;
		const sink = new StreamSink<Unit>();

		// TODO: Unlisten
		element.addEventListener("dblclick", (event) => {
			sink.send(Unit.UNIT);
		});

		return sink;
	}

	@LazyGetter()
	get sClick(): Stream<NaMouseEvent> {
		const element = this.htmlElement;
		const sink = new StreamSink<NaMouseEvent>();

		// TODO: Unlisten
		element.addEventListener("click", (event) => {
			sink.send({
				target: NaElement.from(event.target as HTMLElement),
			});
		});

		return sink;
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
			container.prepend(element.htmlElement);
		});
	}
}
