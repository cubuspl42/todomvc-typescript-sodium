import { NaArray } from "./array";
import { _Vertex, Vertex } from "sodiumjs";

export abstract class NaVertex {
	static from(deps: ReadonlyArray<Vertex>): Vertex;

	static from(deps: NaArray<Vertex>): Vertex;

	static from<A>(deps: NaArray<A>, f: (a: A) => Vertex): Vertex;

	static from<A>(deps: NaArray<Vertex> | NaArray<A> | ReadonlyArray<Vertex>, f?: (a: A) => Vertex): Vertex {
		if (deps instanceof Array) {
			return new ArrayVertex(deps);
		} else if (f !== undefined) {
			return NaVertex.from((deps as NaArray<A>).map(f));
		} else {
			return new NaArrayVertex(deps as NaArray<Vertex>);
		}
	}
}

export class NaNoopVertex extends _Vertex {
	constructor() {
		super();
	}

	buildVisited(): boolean {
		return false;
	}
}

class ArrayVertex extends _Vertex {
	constructor(
		private readonly dependencies: ReadonlyArray<Vertex>,
	) {
		super(dependencies);
	}

	buildVisited(): boolean {
		return false;
	}
}

class NaArrayVertex extends _Vertex {
	private kill2?: () => void;

	constructor(
		private readonly array: NaArray<Vertex>,
	) {
		super();
	}

	protected initialize(): void {
		const content = this.array.cContent.sample();

		content.forEach((vertex) => {
			(vertex as _Vertex).incRefCount();
		});

		this.array.cContent._vertex.incRefCount();
		this.kill2 = this.array.sChange.process((c) => {
			// console.assert(this.refCount > 0);

			const content = this.array.cContent.sample();

			if (c.updates !== undefined) {
				for (const [i, newNode] of c.updates!.entries()) {
					const oldNode = content[i];
					if (oldNode !== newNode) {
						(oldNode as _Vertex).decRefCount();
						(newNode as _Vertex).incRefCount();
					}
				}
			}

			c.inserts?.forEach((vertices) => {
				vertices.forEach((vertex) => {
					(vertex as _Vertex).incRefCount();
				});
			});

			c.deletes?.forEach((i) => {
				const vertex = content[i];
				(vertex as _Vertex).decRefCount();
			});
		});
	}

	protected uninitialize(): void {
		const content = this.array.cContent.sample();

		content.forEach((vertex) => {
			(vertex as _Vertex).decRefCount();
		});

		this.array.cContent._vertex.decRefCount();
		this.kill2!();
	}

	buildVisited(): boolean {
		throw new Error("Method not implemented.");
	}

}
