import { Transaction } from "sodiumjs";

export abstract class NaElement {
	abstract get htmlElement(): HTMLElement;
}

export type NaNode = NaElement | string;

export interface NaElementProps {
	className?: string;
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
