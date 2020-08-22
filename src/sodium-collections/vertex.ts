import { NaArray } from "./array";
import { Vertex } from "sodiumjs";

export abstract class NaVertex {
	private _refCount = 0;

	protected get refCount() {
		return this._refCount;
	}

	incRefCount(): () => void {
		++this._refCount;
		if (this._refCount === 1) {
			this.initialize();
		}
		return () => this._decRefCount();
	}

	_decRefCount() {
		--this._refCount;
		if (this._refCount === 0) {
			this.uninitialize();
		}
	}

	protected abstract initialize(): void;

	protected abstract uninitialize(): void;

	static from(deps: NaArray<NaVertex>): NaVertex;

	static from<A>(deps: NaArray<A>, f: (a: A) => NaVertex): NaVertex;

	static from<A>(deps: NaArray<NaVertex> | NaArray<A>, f?: (a: A) => NaVertex): NaVertex {
		if (f !== undefined) {
			return NaVertex.from((deps as NaArray<A>).map(f));
		} else {
			return new NaArrayVertex(deps as NaArray<NaVertex>);
		}
	}
}

export class NaNoopVertex extends NaVertex {
	constructor() {
		super();
	}

	protected initialize(): void {
	}

	protected uninitialize(): void {
	}
}

class NaVertexVertex extends NaVertex {
	constructor(
		private readonly vertex: Vertex,
	) {
		super();
	}

	protected initialize(): void {
		this.vertex.incRefCount();
	}

	protected uninitialize(): void {
		this.vertex.decRefCount();
	}
}


class NaArrayVertex extends NaVertex {
	private kill2?: () => void;

	constructor(
		private readonly array: NaArray<NaVertex>,
	) {
		super();
	}

	protected initialize(): void {
		const content = this.array.cContent.sample();

		content.forEach((node) => {
			node.incRefCount();
		});

		this.array.cContent.vertex.incRefCount();
		this.kill2 = this.array.sChange.process((c) => {
			// console.assert(this.refCount > 0);

			const content = this.array.cContent.sample();

			if (c.updates !== undefined) {
				for (const [i, newNode] of c.updates!.entries()) {
					const oldNode = content[i];
					if (oldNode !== newNode) {
						oldNode._decRefCount();
						newNode.incRefCount();
					}
				}
			}

			c.inserts?.forEach((nodes) => {
				nodes.forEach((node) => {
					node.incRefCount();
				});
			});

			c.deletes?.forEach((i) => {
				const node = content[i];
				node._decRefCount();
			});
		});
	}

	protected uninitialize(): void {
		const content = this.array.cContent.sample();

		content.forEach((node) => {
			node._decRefCount();
		});

		this.array.cContent.vertex.decRefCount();
		this.kill2!();
	}

}
