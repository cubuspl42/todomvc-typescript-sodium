import { Cell } from "sodiumjs";
import { eventSource } from "./eventSource";

type DispatchTable<A> = {
	[path: string]: () => A;
}

export class Router {
	private readonly onHashChange = eventSource(window, 'hashchange').map(() => location.hash);

	private readonly cHash = this.onHashChange.hold(location.hash);

	dispatch<A>(table: DispatchTable<A>): Cell<A> {
		return this.cHash.map((hash) => {
			const path = hash.slice(1);
			const buildPath = table[path] ?? Object.values(table)[0];
			return buildPath();
		});
	}
}
