import { Cell, StreamSink } from "sodiumjs";

type DispatchTable<A> = {
	[path: string]: () => A;
}

export class Router {
	private readonly onHashChange = new StreamSink<string>();

	private readonly cHash = this.onHashChange.hold(location.hash);

	constructor() {
		// TODO: Unlisten
		window.addEventListener('hashchange', (e) => {
			this.onHashChange.send(location.hash);
		}, false);
	}

	dispatch<A>(table: DispatchTable<A>): Cell<A> {
		return this.cHash.map((hash) => {
			const path = hash.slice(1);
			const buildPath = table[path] ?? Object.values(table)[0];
			return buildPath();
		});
	}
}
