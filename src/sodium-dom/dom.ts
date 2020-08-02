import { Transaction } from "sodiumjs";
import { CellOr } from "./utils";

export abstract class NaElement {
	abstract get htmlElement(): HTMLElement;
}

export type NaNode = NaElement | string;

export interface NaElementProps {
	className?: CellOr<string>;
}

export class NaDOM {
	static render(
		build: () => NaElement,
		container: HTMLElement,
	): void {
		Transaction.run(() => {
			const element = build();
			container.appendChild(element.htmlElement);
		});
	}
}
