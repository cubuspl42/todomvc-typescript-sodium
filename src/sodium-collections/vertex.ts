import { NaArray } from "./array";
import { _Vertex, Transaction, Vertex } from "sodiumjs";

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
		throw new Error("Method not implemented.");
	}
}

class NaArrayVertex extends _Vertex {
	constructor(
		private readonly array: NaArray<Vertex>,
	) {
		super();
	}

	protected initialize(): void {
		super.initialize();

		const contentVertex = this.array.cContent._vertex;
		const content = contentVertex.newValue ?? contentVertex.oldValue;

		content.forEach((vertex) => {
			(vertex as _Vertex).incRefCount();
		});

		contentVertex.incRefCount();
		this.array.sChange._vertex.addDependent(this);
	}

	protected uninitialize(): void {
		// const content = this.array.cContent.sample();
		const contentVertex = this.array.cContent._vertex;
		const content = contentVertex.newValue ?? contentVertex.oldValue;

		// TODO: Don't decRefCount on just-deleted elements
		content.forEach((vertex) => {
			(vertex as _Vertex).decRefCount();
		});

		this.array.sChange._vertex.removeDependent(this);
		this.array.cContent._vertex.decRefCount();

		super.uninitialize();
	}

	process(t: Transaction) {
		const content = this.array.cContent.sample();
		// const contentVertex = this.array.cContent._vertex;
		// const content = contentVertex.newValue ?? contentVertex.oldValue;

		const c = this.array.sChange._vertex.newValue;

		if (c !== undefined) {
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
		}

		super.process(t);
	}

	buildVisited(): boolean {
		throw new Error("Method not implemented.");
	}
}
