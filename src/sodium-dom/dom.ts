import { Stream, StreamSink, Transaction } from "sodiumjs";
import { CellOr } from "./utils";
import { LazyGetter } from "lazy-get-decorator";
import { Key } from 'ts-keycode-enum';

export abstract class NaElement {
	abstract get htmlElement(): HTMLElement;

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
}

export type NaNode = NaElement | string;

export interface NaElementProps {
	readonly id?: string,
	readonly className?: CellOr<string>;
}

export class NaDOM {
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
